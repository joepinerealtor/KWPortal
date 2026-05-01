param(
  [string]$RepositoryRoot = (Get-Location).Path,
  [string]$OutputPath = "data/joe-tech-status.json",
  [string]$CalendlyPersonalAccessToken = $env:CALENDLY_PERSONAL_ACCESS_TOKEN,
  [string]$CalendlyEventTypeUri = $env:CALENDLY_JOE_EVENT_TYPE_URI,
  [string]$CalendlyUserUri = $env:CALENDLY_JOE_USER_URI,
  [string]$CalendlyBookingUrl = $(if ($env:CALENDLY_JOE_BOOKING_URL) { $env:CALENDLY_JOE_BOOKING_URL } else { "https://calendly.com/joepinerealtor/tech-meeting-with-joe" }),
  [string]$CalendlyTimeZone = $env:CALENDLY_JOE_TIMEZONE,
  [int]$DefaultDurationMinutes = $(if ($env:CALENDLY_JOE_EVENT_DURATION_MINUTES) { [int]$env:CALENDLY_JOE_EVENT_DURATION_MINUTES } else { 30 })
)

$ErrorActionPreference = "Stop"
$JoeWorkingHours = @(
  [ordered]@{ Day = "Wednesday"; Start = "09:00"; End = "17:00" },
  [ordered]@{ Day = "Thursday"; Start = "09:00"; End = "17:00" },
  [ordered]@{ Day = "Friday"; Start = "09:00"; End = "16:00" }
)

function Get-CalendlyHeaders {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Token
  )

  return @{
    Authorization = "Bearer $Token"
    "Content-Type" = "application/json"
  }
}

function Get-CalendlyEventTypeId {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $trimmed = $Value.Trim()
  if ($trimmed -notmatch "[:/]") {
    return $trimmed
  }

  $uri = [Uri]$trimmed
  $segments = $uri.AbsolutePath.Trim("/").Split("/")
  if (-not $segments.Count) {
    throw "Could not determine Calendly event type id from '$Value'."
  }

  return $segments[-1]
}

function Get-ParsedDurationMinutes {
  param(
    $Value,
    [int]$Fallback
  )

  $parsed = 0
  if ([int]::TryParse([string]$Value, [ref]$parsed) -and $parsed -gt 0) {
    return $parsed
  }

  return $Fallback
}

function Format-UtcIsoForPortal {
  param(
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$Value
  )

  return $Value.ToUniversalTime().UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'", [Globalization.CultureInfo]::InvariantCulture)
}

function Invoke-CalendlyRequest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Uri,
    [Parameter(Mandatory = $true)]
    [hashtable]$Headers
  )

  return Invoke-RestMethod -Method Get -Uri $Uri -Headers $Headers
}

function Get-CalendlyCollectionItems {
  param(
    $Response
  )

  if ($null -eq $Response) {
    return @()
  }

  if ($Response.PSObject.Properties.Name -contains "collection" -and $null -ne $Response.collection) {
    return @($Response.collection)
  }

  return @($Response)
}

function Resolve-CalendlyUserUri {
  param(
    [string]$ConfiguredUserUri,
    [Parameter(Mandatory = $true)]
    [hashtable]$Headers
  )

  if (-not [string]::IsNullOrWhiteSpace($ConfiguredUserUri)) {
    $trimmed = $ConfiguredUserUri.Trim()
    if ($trimmed -match "^https?://") {
      return $trimmed
    }

    return "https://api.calendly.com/users/$trimmed"
  }

  $currentUserResponse = Invoke-CalendlyRequest -Uri "https://api.calendly.com/users/me" -Headers $Headers
  $currentUserResource = if ($null -ne $currentUserResponse.resource) { $currentUserResponse.resource } else { $currentUserResponse }

  if (-not $currentUserResource.uri) {
    throw "Could not determine Calendly user URI from /users/me."
  }

  return [string]$currentUserResource.uri
}

function Get-TimeZoneInfoFromId {
  param(
    [string]$TimeZoneId
  )

  $resolvedId = if ([string]::IsNullOrWhiteSpace($TimeZoneId)) {
    "America/New_York"
  } else {
    $TimeZoneId.Trim()
  }

  foreach ($candidate in @($resolvedId, "Eastern Standard Time")) {
    try {
      return [TimeZoneInfo]::FindSystemTimeZoneById($candidate)
    } catch {
      continue
    }
  }

  return [TimeZoneInfo]::Local
}

function Get-TimeOfDayMinutes {
  param(
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return -1
  }

  $match = [regex]::Match($Value.Trim(), "^(?<hours>\d{1,2}):(?<minutes>\d{2})$")
  if (-not $match.Success) {
    return -1
  }

  $hours = [int]$match.Groups["hours"].Value
  $minutes = [int]$match.Groups["minutes"].Value
  if ($hours -lt 0 -or $hours -gt 23 -or $minutes -lt 0 -or $minutes -gt 59) {
    return -1
  }

  return ($hours * 60) + $minutes
}

function Test-IsWithinJoeWorkingHours {
  param(
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$UtcStart,
    [Parameter(Mandatory = $true)]
    [int]$DurationMinutes,
    [Parameter(Mandatory = $true)]
    [string]$TimeZoneId,
    [Parameter(Mandatory = $true)]
    [array]$WorkingHours
  )

  if (-not $WorkingHours.Count) {
    return $true
  }

  $timeZoneInfo = Get-TimeZoneInfoFromId -TimeZoneId $TimeZoneId
  $localStart = [TimeZoneInfo]::ConvertTime($UtcStart, $timeZoneInfo)
  $localEnd = [TimeZoneInfo]::ConvertTime($UtcStart.AddMinutes($DurationMinutes), $timeZoneInfo)

  if ($localStart.DayOfWeek -ne $localEnd.DayOfWeek) {
    return $false
  }

  $rule = $WorkingHours | Where-Object { $_.Day -eq $localStart.DayOfWeek.ToString() } | Select-Object -First 1
  if (-not $rule) {
    return $false
  }

  $ruleStartMinutes = Get-TimeOfDayMinutes -Value $rule.Start
  $ruleEndMinutes = Get-TimeOfDayMinutes -Value $rule.End
  if ($ruleStartMinutes -lt 0 -or $ruleEndMinutes -lt 0 -or $ruleEndMinutes -le $ruleStartMinutes) {
    return $false
  }

  $startMinutes = ($localStart.Hour * 60) + $localStart.Minute
  $endMinutes = ($localEnd.Hour * 60) + $localEnd.Minute

  return $startMinutes -ge $ruleStartMinutes -and $endMinutes -le $ruleEndMinutes
}

function Test-IsWithinJoeWorkingHoursNow {
  param(
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$UtcNow,
    [Parameter(Mandatory = $true)]
    [string]$TimeZoneId,
    [Parameter(Mandatory = $true)]
    [array]$WorkingHours
  )

  if (-not $WorkingHours.Count) {
    return $true
  }

  $timeZoneInfo = Get-TimeZoneInfoFromId -TimeZoneId $TimeZoneId
  $localNow = [TimeZoneInfo]::ConvertTime($UtcNow, $timeZoneInfo)
  $rule = $WorkingHours | Where-Object { $_.Day -eq $localNow.DayOfWeek.ToString() } | Select-Object -First 1
  if (-not $rule) {
    return $false
  }

  $ruleStartMinutes = Get-TimeOfDayMinutes -Value $rule.Start
  $ruleEndMinutes = Get-TimeOfDayMinutes -Value $rule.End
  if ($ruleStartMinutes -lt 0 -or $ruleEndMinutes -lt 0 -or $ruleEndMinutes -le $ruleStartMinutes) {
    return $false
  }

  $nowMinutes = ($localNow.Hour * 60) + $localNow.Minute
  return $nowMinutes -ge $ruleStartMinutes -and $nowMinutes -lt $ruleEndMinutes
}

function Get-JoeWorkingWindowForUtcTime {
  param(
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$UtcTime,
    [Parameter(Mandatory = $true)]
    [string]$TimeZoneId,
    [Parameter(Mandatory = $true)]
    [array]$WorkingHours
  )

  if (-not $WorkingHours.Count) {
    return $null
  }

  $timeZoneInfo = Get-TimeZoneInfoFromId -TimeZoneId $TimeZoneId
  $localTime = [TimeZoneInfo]::ConvertTime($UtcTime, $timeZoneInfo)
  $rule = $WorkingHours | Where-Object { $_.Day -eq $localTime.DayOfWeek.ToString() } | Select-Object -First 1
  if (-not $rule) {
    return $null
  }

  $ruleStartMinutes = Get-TimeOfDayMinutes -Value $rule.Start
  $ruleEndMinutes = Get-TimeOfDayMinutes -Value $rule.End
  if ($ruleStartMinutes -lt 0 -or $ruleEndMinutes -lt 0 -or $ruleEndMinutes -le $ruleStartMinutes) {
    return $null
  }

  $localDayStart = [DateTime]::new($localTime.Year, $localTime.Month, $localTime.Day, 0, 0, 0, [DateTimeKind]::Unspecified)
  $windowStartLocal = $localDayStart.AddMinutes($ruleStartMinutes)
  $windowEndLocal = $localDayStart.AddMinutes($ruleEndMinutes)
  $windowStartUtc = [DateTimeOffset]::new([DateTime]::SpecifyKind([TimeZoneInfo]::ConvertTimeToUtc($windowStartLocal, $timeZoneInfo), [DateTimeKind]::Utc))
  $windowEndUtc = [DateTimeOffset]::new([DateTime]::SpecifyKind([TimeZoneInfo]::ConvertTimeToUtc($windowEndLocal, $timeZoneInfo), [DateTimeKind]::Utc))

  return [pscustomobject]@{
    Start = $windowStartUtc
    End = $windowEndUtc
  }
}

function Get-CalendlyBookingSlugs {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BookingUrl
  )

  $uri = [Uri]$BookingUrl
  $segments = @($uri.AbsolutePath.Trim("/").Split("/") | Where-Object { $_ })

  if ($segments.Count -ge 2 -and $segments[0] -ne "d") {
    return @{
      ProfileSlug = $segments[0]
      EventTypeSlug = $segments[1]
    }
  }

  throw "Could not determine Calendly profile and event slugs from '$BookingUrl'."
}

function Get-NextPublicCalendlySlot {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BookingUrl,
    [int]$FallbackDurationMinutes,
    [Parameter(Mandatory = $true)]
    [array]$WorkingHours
  )

  $slugs = Get-CalendlyBookingSlugs -BookingUrl $BookingUrl
  $lookupUri = "https://calendly.com/api/booking/event_types/lookup?event_type_slug=$([Uri]::EscapeDataString($slugs.EventTypeSlug))&profile_slug=$([Uri]::EscapeDataString($slugs.ProfileSlug))"
  $lookup = Invoke-RestMethod -Method Get -Uri $lookupUri -Headers @{ Accept = "application/json" }
  $resolvedTimeZone = if ($lookup.availability_timezone) { $lookup.availability_timezone } elseif ($lookup.profile.timezone) { $lookup.profile.timezone } else { "America/New_York" }
  $resolvedDuration = Get-ParsedDurationMinutes -Value $lookup.duration -Fallback $FallbackDurationMinutes
  $schedulingLinkUuid = if ($lookup.scheduling_link.uid) { $lookup.scheduling_link.uid } else { "" }
  $rangeStart = [DateTimeOffset]::UtcNow.AddDays(-1).ToString("yyyy-MM-dd")
  $rangeEnd = [DateTimeOffset]::UtcNow.AddDays(7).ToString("yyyy-MM-dd")
  $rangeUri = "https://calendly.com/api/booking/event_types/$($lookup.uuid)/calendar/range?timezone=$([Uri]::EscapeDataString($resolvedTimeZone))&diagnostics=false&range_start=$rangeStart&range_end=$rangeEnd"

  if (-not [string]::IsNullOrWhiteSpace($schedulingLinkUuid)) {
    $rangeUri = "$rangeUri&scheduling_link_uuid=$([Uri]::EscapeDataString($schedulingLinkUuid))"
  }

  $range = Invoke-RestMethod -Method Get -Uri $rangeUri -Headers @{ Accept = "application/json" }
  $now = [DateTimeOffset]::UtcNow
  $availableSlots = @()

  foreach ($day in @($range.days)) {
    foreach ($spot in @($day.spots)) {
      if ($spot.status -eq "available" -and $spot.start_time) {
        $slotStart = [DateTimeOffset]::Parse($spot.start_time).ToUniversalTime()
        if ($slotStart -gt $now.AddMinutes(-1) -and (Test-IsWithinJoeWorkingHours -UtcStart $slotStart -DurationMinutes $resolvedDuration -TimeZoneId $resolvedTimeZone -WorkingHours $WorkingHours)) {
          $availableSlots += $slotStart
        }
      }
    }
  }

  $nextOpenSlot = $availableSlots | Sort-Object | Select-Object -First 1

  return @{
    TimeZone = $resolvedTimeZone
    DurationMinutes = $resolvedDuration
    NextOpenSlotIso = if ($nextOpenSlot) { Format-UtcIsoForPortal -Value $nextOpenSlot } else { "" }
    AvailableSlotIsos = @($availableSlots | Sort-Object | ForEach-Object { Format-UtcIsoForPortal -Value $_ })
  }
}

function Get-CalendlyBusyRanges {
  param(
    [Parameter(Mandatory = $true)]
    [string]$UserUri,
    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$ReferenceTime
  )

  $busyQueryStart = $ReferenceTime.ToUniversalTime()
  $busyQueryEnd = $busyQueryStart.AddDays(7)
  $busyEndpoint = "https://api.calendly.com/user_busy_times?user=$([Uri]::EscapeDataString($UserUri))&start_time=$([Uri]::EscapeDataString($busyQueryStart.ToString("o")))&end_time=$([Uri]::EscapeDataString($busyQueryEnd.ToString("o")))"
  $busyResponse = Invoke-CalendlyRequest -Uri $busyEndpoint -Headers $Headers
  return Get-CalendlyCollectionItems -Response $busyResponse |
    ForEach-Object {
      if (-not $_.start_time -or -not $_.end_time) {
        return
      }

      try {
        $rangeStart = [DateTimeOffset]::Parse([string]$_.start_time).ToUniversalTime()
        $rangeEnd = [DateTimeOffset]::Parse([string]$_.end_time).ToUniversalTime()
      } catch {
        return
      }

      if ($rangeEnd -gt $ReferenceTime) {
        [pscustomobject]@{
          Start = $rangeStart
          End = $rangeEnd
        }
      }
    } |
    Sort-Object Start
}

function Get-AvailableNowEnd {
  param(
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$Now,
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$SlotEnd,
    $WorkingWindow,
    [Parameter(Mandatory = $true)]
    [array]$BusyRanges,
    [bool]$CanUseBusyRanges
  )

  $availableEnd = $SlotEnd

  if ($WorkingWindow -and $WorkingWindow.End -gt $Now -and $WorkingWindow.End -lt $availableEnd) {
    $availableEnd = $WorkingWindow.End
  }

  if ($CanUseBusyRanges) {
    $nextBusyRange = $BusyRanges |
      Where-Object { $_.Start -gt $Now -and $_.Start -lt $availableEnd } |
      Sort-Object Start |
      Select-Object -First 1

    if ($nextBusyRange) {
      $availableEnd = $nextBusyRange.Start
    }
  }

  if ($availableEnd -le $Now) {
    return $SlotEnd
  }

  return $availableEnd
}

function Get-AvailableIntervalContainingTime {
  param(
    [Parameter(Mandatory = $true)]
    [array]$SlotStarts,
    [Parameter(Mandatory = $true)]
    [DateTimeOffset]$ReferenceTime,
    [Parameter(Mandatory = $true)]
    [int]$DurationMinutes,
    [bool]$AllowNearFutureStart
  )

  if (-not $SlotStarts.Count -or $DurationMinutes -le 0) {
    return $null
  }

  $sortedStarts = @($SlotStarts | Sort-Object)
  $currentStart = $null
  $currentEnd = $null
  $nearFutureThreshold = $ReferenceTime.AddMinutes($DurationMinutes)

  foreach ($slotStartValue in $sortedStarts) {
    $slotStart = ([DateTimeOffset]$slotStartValue).ToUniversalTime()
    $slotEnd = $slotStart.AddMinutes($DurationMinutes)

    if ($null -eq $currentStart) {
      $currentStart = $slotStart
      $currentEnd = $slotEnd
      continue
    }

    if ($slotStart -le $currentEnd.AddSeconds(60)) {
      if ($slotEnd -gt $currentEnd) {
        $currentEnd = $slotEnd
      }
      continue
    }

    if (($currentStart -le $ReferenceTime -and $ReferenceTime -lt $currentEnd) -or ($AllowNearFutureStart -and $ReferenceTime -lt $currentStart -and $currentStart -le $nearFutureThreshold)) {
      return [pscustomobject]@{
        Start = $currentStart
        End = $currentEnd
      }
    }

    $currentStart = $slotStart
    $currentEnd = $slotEnd
  }

  if (($currentStart -le $ReferenceTime -and $ReferenceTime -lt $currentEnd) -or ($AllowNearFutureStart -and $ReferenceTime -lt $currentStart -and $currentStart -le $nearFutureThreshold)) {
    return [pscustomobject]@{
      Start = $currentStart
      End = $currentEnd
    }
  }

  return $null
}

$resolvedOutputPath = Join-Path $RepositoryRoot $OutputPath
$resolvedOutputDirectory = Split-Path $resolvedOutputPath -Parent
if (-not (Test-Path $resolvedOutputDirectory)) {
  New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null
}

$previousState = $null
if (Test-Path $resolvedOutputPath) {
  try {
    $previousState = Get-Content -Raw $resolvedOutputPath | ConvertFrom-Json
  } catch {
    $previousState = $null
  }
}

$timeZone = "America/New_York"
$durationMinutes = $DefaultDurationMinutes
$nextOpenSlotIso = ""
$nextOpenSlotWorkingWindowEndIso = ""
$busyNowStartIso = ""
$busyNowEndIso = ""
$nextBusyStartIso = ""
$nextBusyEndIso = ""
$nextAppointmentAvailableIso = ""
$availableNowEndIso = ""
$currentUtcNow = [DateTimeOffset]::UtcNow
$resolvedCalendlyHeaders = $null
$didResolveAvailabilityFromApi = $false
$didResolveBusyRangesFromApi = $false
$busyRanges = @()
$availableSlotStarts = @()

if (-not [string]::IsNullOrWhiteSpace($CalendlyPersonalAccessToken)) {
  $resolvedCalendlyHeaders = Get-CalendlyHeaders -Token $CalendlyPersonalAccessToken
}

if ($resolvedCalendlyHeaders -and -not [string]::IsNullOrWhiteSpace($CalendlyEventTypeUri)) {
  try {
    $timeZone = if ([string]::IsNullOrWhiteSpace($CalendlyTimeZone)) {
      "America/New_York"
    } else {
      $CalendlyTimeZone.Trim()
    }

    $eventTypeId = Get-CalendlyEventTypeId -Value $CalendlyEventTypeUri
    $eventTypeEndpoint = "https://api.calendly.com/event_types/$eventTypeId"
    $eventTypeResponse = Invoke-CalendlyRequest -Uri $eventTypeEndpoint -Headers $resolvedCalendlyHeaders
    $eventTypeResource = if ($null -ne $eventTypeResponse.resource) { $eventTypeResponse.resource } else { $eventTypeResponse }
    $durationMinutes = Get-ParsedDurationMinutes -Value $eventTypeResource.duration -Fallback $DefaultDurationMinutes

    $startTime = $currentUtcNow.AddMinutes(1).ToUniversalTime()
    $endTime = $startTime.AddDays(7)
    $availabilityEndpoint = "https://api.calendly.com/event_type_available_times?event_type=$([Uri]::EscapeDataString($CalendlyEventTypeUri))&start_time=$([Uri]::EscapeDataString($startTime.ToString("o")))&end_time=$([Uri]::EscapeDataString($endTime.ToString("o")))"
    $availabilityResponse = Invoke-CalendlyRequest -Uri $availabilityEndpoint -Headers $resolvedCalendlyHeaders
    $availableSlots = Get-CalendlyCollectionItems -Response $availabilityResponse
    $didResolveAvailabilityFromApi = $true

    if ($availableSlots.Count -gt 0) {
      $slotStarts = @()
      foreach ($slot in @($availableSlots)) {
        if (-not $slot.start_time) {
          continue
        }

        try {
          $slotStart = [DateTimeOffset]::Parse([string]$slot.start_time).ToUniversalTime()
        } catch {
          continue
        }

        if (Test-IsWithinJoeWorkingHours -UtcStart $slotStart -DurationMinutes $durationMinutes -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours) {
          $slotStarts += $slotStart
        }
      }

      $availableSlotStarts = @($slotStarts | Sort-Object)
      $nextOpenSlot = $availableSlotStarts | Select-Object -First 1

      if ($nextOpenSlot) {
        $nextOpenSlotIso = Format-UtcIsoForPortal -Value $nextOpenSlot
      }
    }
  } catch {
    Write-Warning "Could not refresh Joe tech availability from Calendly API: $($_.Exception.Message)"
  }
}

if (-not $didResolveAvailabilityFromApi) {
  try {
    $publicAvailability = Get-NextPublicCalendlySlot -BookingUrl $CalendlyBookingUrl -FallbackDurationMinutes $DefaultDurationMinutes -WorkingHours $JoeWorkingHours
    $timeZone = $publicAvailability.TimeZone
    $durationMinutes = $publicAvailability.DurationMinutes
    $nextOpenSlotIso = $publicAvailability.NextOpenSlotIso
    $availableSlotStarts = @($publicAvailability.AvailableSlotIsos | ForEach-Object { [DateTimeOffset]::Parse([string]$_).ToUniversalTime() } | Sort-Object)
  } catch {
    Write-Warning "Could not refresh Joe tech availability from Calendly: $($_.Exception.Message)"
  }
}

if ($resolvedCalendlyHeaders) {
  try {
    $resolvedCalendlyUserUri = Resolve-CalendlyUserUri -ConfiguredUserUri $CalendlyUserUri -Headers $resolvedCalendlyHeaders
    $busyRanges = @(Get-CalendlyBusyRanges -UserUri $resolvedCalendlyUserUri -Headers $resolvedCalendlyHeaders -ReferenceTime $currentUtcNow)
    $didResolveBusyRangesFromApi = $true
    $activeBusyRange = $busyRanges |
      Where-Object { $_.Start -le $currentUtcNow -and $_.End -gt $currentUtcNow } |
      Sort-Object Start |
      Select-Object -First 1

    if ($activeBusyRange) {
      $busyNowStartIso = Format-UtcIsoForPortal -Value $activeBusyRange.Start
      $busyNowEndIso = Format-UtcIsoForPortal -Value $activeBusyRange.End
    }

    $nextBusyRange = $busyRanges |
      Where-Object { $_.Start -gt $currentUtcNow } |
      Sort-Object Start |
      Select-Object -First 1

    if ($nextBusyRange) {
      $nextBusyStartIso = Format-UtcIsoForPortal -Value $nextBusyRange.Start
      $nextBusyEndIso = Format-UtcIsoForPortal -Value $nextBusyRange.End
    }
  } catch {
    Write-Warning "Could not refresh Joe busy-time status from Calendly API: $($_.Exception.Message)"
  }
}

if ($previousState -and -not [string]::IsNullOrWhiteSpace($previousState.nextOpenSlotIso)) {
  try {
    $previousDurationMinutes = Get-ParsedDurationMinutes -Value $previousState.eventDurationMinutes -Fallback $durationMinutes
    $previousSlotStart = [DateTimeOffset]::Parse($previousState.nextOpenSlotIso).ToUniversalTime()
    $previousSlotEnd = $previousSlotStart.AddMinutes($previousDurationMinutes)
    $nowForPreviousSlot = [DateTimeOffset]::UtcNow
    $nextSlotStart = if ([string]::IsNullOrWhiteSpace($nextOpenSlotIso)) { $null } else { [DateTimeOffset]::Parse($nextOpenSlotIso).ToUniversalTime() }

    if ($nowForPreviousSlot -ge $previousSlotStart -and $nowForPreviousSlot -lt $previousSlotEnd -and (-not $nextSlotStart -or $nextSlotStart -gt $previousSlotStart)) {
      $durationMinutes = $previousDurationMinutes
      $availableSlotStarts = @($availableSlotStarts + $previousSlotStart | Sort-Object)
      $nextOpenSlotIso = Format-UtcIsoForPortal -Value $previousSlotStart
    }
  } catch {
    # If the previous feed has an older timestamp format, ignore it and use the fresh Calendly result.
  }
}

if (-not [string]::IsNullOrWhiteSpace($nextOpenSlotIso)) {
  try {
    $nextOpenSlotWindow = Get-JoeWorkingWindowForUtcTime -UtcTime ([DateTimeOffset]::Parse($nextOpenSlotIso).ToUniversalTime()) -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours
    if ($nextOpenSlotWindow) {
      $nextOpenSlotWorkingWindowEndIso = Format-UtcIsoForPortal -Value $nextOpenSlotWindow.End
    }
  } catch {
    $nextOpenSlotWorkingWindowEndIso = ""
  }
}

$status = "unavailable"
$now = [DateTimeOffset]::UtcNow
$isWithinWorkingHoursNow = Test-IsWithinJoeWorkingHoursNow -UtcNow $now -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours
$isBusyNow = $false

if (-not [string]::IsNullOrWhiteSpace($busyNowEndIso)) {
  try {
    $busyNowStart = if ([string]::IsNullOrWhiteSpace($busyNowStartIso)) { $null } else { [DateTimeOffset]::Parse($busyNowStartIso).ToUniversalTime() }
    $busyNowEnd = [DateTimeOffset]::Parse($busyNowEndIso).ToUniversalTime()

    if ($busyNowEnd -gt $now -and (-not $busyNowStart -or $busyNowStart -le $now)) {
      $isBusyNow = $true
    }
  } catch {
    $isBusyNow = $false
  }
}

$currentWorkingWindow = if ($isWithinWorkingHoursNow) {
  Get-JoeWorkingWindowForUtcTime -UtcTime $now -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours
} else {
  $null
}

if (-not $isBusyNow -and $didResolveBusyRangesFromApi -and $isWithinWorkingHoursNow -and $currentWorkingWindow) {
  $status = "available_now"
  $nextBusyRangeDuringCurrentWindow = $busyRanges |
    Where-Object { $_.Start -gt $now -and $_.Start -lt $currentWorkingWindow.End } |
    Sort-Object Start |
    Select-Object -First 1

  $availableNowEnd = if ($nextBusyRangeDuringCurrentWindow) {
    $nextBusyRangeDuringCurrentWindow.Start
  } else {
    $currentWorkingWindow.End
  }
  $availableNowEndIso = Format-UtcIsoForPortal -Value $availableNowEnd

  $nextAppointmentSearchStart = $availableNowEnd
  if ($nextBusyRangeDuringCurrentWindow) {
    $nextBusyStartIso = Format-UtcIsoForPortal -Value $nextBusyRangeDuringCurrentWindow.Start
    $nextBusyEndIso = Format-UtcIsoForPortal -Value $nextBusyRangeDuringCurrentWindow.End
    $nextAppointmentSearchStart = $nextBusyRangeDuringCurrentWindow.End
  }

  $nextAppointmentAvailable = $availableSlotStarts |
    Where-Object { $_ -ge $nextAppointmentSearchStart.AddSeconds(-1) } |
    Sort-Object |
    Select-Object -First 1

  if ($nextAppointmentAvailable) {
    $nextAppointmentAvailableIso = Format-UtcIsoForPortal -Value $nextAppointmentAvailable
  }
} else {
  $nextAppointmentAvailable = $availableSlotStarts |
    Where-Object { $_ -gt $now } |
    Sort-Object |
    Select-Object -First 1

  if ($nextAppointmentAvailable) {
    $nextAppointmentAvailableIso = Format-UtcIsoForPortal -Value $nextAppointmentAvailable
  } elseif (-not [string]::IsNullOrWhiteSpace($busyNowEndIso)) {
    $nextAppointmentAvailableIso = $busyNowEndIso
  }
}

$payload = [ordered]@{
  status = $status
  timezone = $timeZone
  eventDurationMinutes = $durationMinutes
  nextOpenSlotIso = $nextOpenSlotIso
  nextOpenSlotWorkingWindowEndIso = $nextOpenSlotWorkingWindowEndIso
  availableNowEndIso = $availableNowEndIso
  busyNowStartIso = $busyNowStartIso
  busyNowEndIso = $busyNowEndIso
  nextBusyStartIso = $nextBusyStartIso
  nextBusyEndIso = $nextBusyEndIso
  nextAppointmentAvailableIso = $nextAppointmentAvailableIso
  workingHours = @(
    $JoeWorkingHours | ForEach-Object {
      [ordered]@{
        day = $_.Day
        start = $_.Start
        end = $_.End
      }
    }
  )
  availableNowLabel = "Joe is available to chat"
  availableNowSummary = "Schedule an appointment with Joe."
  busyNowLabel = "Joe is in another appointment"
  unavailableLabel = "Joe is unavailable"
  noSlotsSummary = "No open tech-help slots are listed right now."
}

$nextContent = ($payload | ConvertTo-Json -Depth 5) + "`n"
$currentContent = if (Test-Path $resolvedOutputPath) { Get-Content -Raw $resolvedOutputPath } else { "" }

if ($currentContent -eq $nextContent) {
  Write-Host "Joe tech status feed is already up to date."
  exit 0
}

[System.IO.File]::WriteAllText($resolvedOutputPath, $nextContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "Updated $resolvedOutputPath"
