param(
  [string]$RepositoryRoot = (Get-Location).Path,
  [string]$OutputPath = "data/joe-tech-status.json",
  [string]$CalendlyPersonalAccessToken = $env:CALENDLY_PERSONAL_ACCESS_TOKEN,
  [string]$CalendlyEventTypeUri = $env:CALENDLY_JOE_EVENT_TYPE_URI,
  [string]$CalendlyBookingUrl = $(if ($env:CALENDLY_JOE_BOOKING_URL) { $env:CALENDLY_JOE_BOOKING_URL } else { "https://calendly.com/joepinerealtor/tech-meeting-with-joe" }),
  [string]$CalendlyTimeZone = $env:CALENDLY_JOE_TIMEZONE,
  [int]$DefaultDurationMinutes = $(if ($env:CALENDLY_JOE_EVENT_DURATION_MINUTES) { [int]$env:CALENDLY_JOE_EVENT_DURATION_MINUTES } else { 30 }),
  [int]$AvailableWindowMinutes = $(if ($env:CALENDLY_JOE_AVAILABLE_WINDOW_MINUTES) { [int]$env:CALENDLY_JOE_AVAILABLE_WINDOW_MINUTES } else { 60 })
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

function Invoke-CalendlyRequest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Uri,
    [Parameter(Mandatory = $true)]
    [hashtable]$Headers
  )

  return Invoke-RestMethod -Method Get -Uri $Uri -Headers $Headers
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
    NextOpenSlotIso = if ($nextOpenSlot) { $nextOpenSlot.ToUniversalTime().ToString("o") } else { "" }
  }
}

$resolvedOutputPath = Join-Path $RepositoryRoot $OutputPath
$resolvedOutputDirectory = Split-Path $resolvedOutputPath -Parent
if (-not (Test-Path $resolvedOutputDirectory)) {
  New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null
}

$timeZone = "America/New_York"
$durationMinutes = $DefaultDurationMinutes
$nextOpenSlotIso = ""

try {
  if (-not [string]::IsNullOrWhiteSpace($CalendlyPersonalAccessToken) -and -not [string]::IsNullOrWhiteSpace($CalendlyEventTypeUri)) {
    $timeZone = if ([string]::IsNullOrWhiteSpace($CalendlyTimeZone)) {
      "America/New_York"
    } else {
      $CalendlyTimeZone.Trim()
    }

    $headers = Get-CalendlyHeaders -Token $CalendlyPersonalAccessToken
    $eventTypeId = Get-CalendlyEventTypeId -Value $CalendlyEventTypeUri
    $eventTypeEndpoint = "https://api.calendly.com/event_types/$eventTypeId"
    $eventTypeResponse = Invoke-CalendlyRequest -Uri $eventTypeEndpoint -Headers $headers
    $eventTypeResource = if ($null -ne $eventTypeResponse.resource) { $eventTypeResponse.resource } else { $eventTypeResponse }
    $durationMinutes = Get-ParsedDurationMinutes -Value $eventTypeResource.duration -Fallback $DefaultDurationMinutes

    $startTime = [DateTimeOffset]::UtcNow.AddMinutes(1).ToUniversalTime()
    $endTime = $startTime.AddDays(7)
    $availabilityEndpoint = "https://api.calendly.com/event_type_available_times?event_type=$([Uri]::EscapeDataString($CalendlyEventTypeUri))&start_time=$([Uri]::EscapeDataString($startTime.ToString("o")))&end_time=$([Uri]::EscapeDataString($endTime.ToString("o")))"
    $availabilityResponse = Invoke-CalendlyRequest -Uri $availabilityEndpoint -Headers $headers
    $availableSlots = @($availabilityResponse.collection)

    if ($availableSlots.Count -gt 0) {
      $nextOpenSlot = $availableSlots |
        Where-Object {
          $_.start_time -and (Test-IsWithinJoeWorkingHours -UtcStart ([DateTimeOffset]::Parse($_.start_time).ToUniversalTime()) -DurationMinutes $durationMinutes -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours)
        } |
        Sort-Object { [DateTimeOffset]::Parse($_.start_time) } |
        Select-Object -First 1

      if ($nextOpenSlot.start_time) {
        $nextOpenSlotIso = ([DateTimeOffset]::Parse($nextOpenSlot.start_time)).ToUniversalTime().ToString("o")
      }
    }
  } else {
    $publicAvailability = Get-NextPublicCalendlySlot -BookingUrl $CalendlyBookingUrl -FallbackDurationMinutes $DefaultDurationMinutes -WorkingHours $JoeWorkingHours
    $timeZone = $publicAvailability.TimeZone
    $durationMinutes = $publicAvailability.DurationMinutes
    $nextOpenSlotIso = $publicAvailability.NextOpenSlotIso
  }
} catch {
  Write-Warning "Could not refresh Joe tech status from Calendly: $($_.Exception.Message)"
}

$status = "unavailable"
if (-not [string]::IsNullOrWhiteSpace($nextOpenSlotIso)) {
  $now = [DateTimeOffset]::UtcNow
  $slotStart = [DateTimeOffset]::Parse($nextOpenSlotIso).ToUniversalTime()
  $slotEnd = $slotStart.AddMinutes($durationMinutes)
  $isWithinWorkingHoursNow = Test-IsWithinJoeWorkingHoursNow -UtcNow $now -TimeZoneId $timeZone -WorkingHours $JoeWorkingHours

  if ($isWithinWorkingHoursNow -and (($now -ge $slotStart -and $now -lt $slotEnd) -or ($slotStart -gt $now -and $slotStart -le $now.AddMinutes($AvailableWindowMinutes)))) {
    $status = "available"
  }
}

$payload = [ordered]@{
  status = $status
  timezone = $timeZone
  eventDurationMinutes = $durationMinutes
  availableWindowMinutes = $AvailableWindowMinutes
  nextOpenSlotIso = $nextOpenSlotIso
  workingHours = @(
    $JoeWorkingHours | ForEach-Object {
      [ordered]@{
        day = $_.Day
        start = $_.Start
        end = $_.End
      }
    }
  )
  availableLabel = "Joe is available to chat"
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
