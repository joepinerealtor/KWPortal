param(
  [string]$RepositoryRoot = (Get-Location).Path,
  [string]$OutputPath = "data/ri-market.json",
  [string]$SourceUrl = $(if ($env:RI_MARKET_SOURCE_URL) { $env:RI_MARKET_SOURCE_URL } else { "https://www.rirealtors.org/" })
)

$ErrorActionPreference = "Stop"

function Normalize-Text {
  param(
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $decoded = [System.Net.WebUtility]::HtmlDecode($Value)
  return ($decoded -replace "\s+", " ").Trim()
}

function Remove-HtmlTags {
  param(
    [string]$Value
  )

  return Normalize-Text ($Value -replace "<[^>]+>", " ")
}

function Normalize-Comparison {
  param(
    [string]$Value
  )

  $normalized = Normalize-Text $Value
  if ([string]::IsNullOrWhiteSpace($normalized)) {
    return ""
  }

  if ($normalized.StartsWith([string][char]0x2191)) {
    return "+$($normalized.Substring(1).Trim())"
  }

  if ($normalized.StartsWith([string][char]0x2193)) {
    return "-$($normalized.Substring(1).Trim())"
  }

  return $normalized
}

function Format-MarketPeriod {
  param(
    [string]$RawPeriod
  )

  $normalized = Normalize-Text $RawPeriod
  if ([string]::IsNullOrWhiteSpace($normalized)) {
    return ""
  }

  $parts = $normalized -split "\s*-\s*"
  $segment = ""
  $periodPart = $normalized
  if ($parts.Count -gt 1) {
    $segment = $parts[0]
    $periodPart = ($parts | Select-Object -Skip 1) -join " - "
  }

  $parsed = [DateTime]::MinValue
  $styles = [Globalization.DateTimeStyles]::AssumeLocal
  $culture = [Globalization.CultureInfo]::GetCultureInfo("en-US")
  if ([DateTime]::TryParse($periodPart, $culture, $styles, [ref]$parsed)) {
    $periodPart = $parsed.ToString("MMM yyyy", $culture)
  }

  if (-not [string]::IsNullOrWhiteSpace($segment)) {
    return "$segment - $periodPart"
  }

  return $periodPart
}

function Get-StatValue {
  param(
    [string]$StatHtml
  )

  $prefix = Normalize-Text ([regex]::Match($StatHtml, '<span class="prefix">(?<value>.*?)</span>', "Singleline,IgnoreCase").Groups["value"].Value)
  $number = Normalize-Text ([regex]::Match($StatHtml, '<span class="number">(?<value>.*?)</span>', "Singleline,IgnoreCase").Groups["value"].Value)
  $suffix = Normalize-Text ([regex]::Match($StatHtml, '<span class="suffix">(?<value>.*?)</span>', "Singleline,IgnoreCase").Groups["value"].Value)

  $value = "$prefix$number".Trim()
  if (-not [string]::IsNullOrWhiteSpace($suffix)) {
    if ([string]::IsNullOrWhiteSpace($prefix)) {
      $value = "$value $suffix".Trim()
    } else {
      $value = "$value$suffix".Trim()
    }
  }

  return $value
}

function Get-QuickStatMap {
  param(
    [string]$SectionHtml
  )

  $stats = @{}
  $statMatches = [regex]::Matches($SectionHtml, '<div class="cell quickStat">(?<html>.*?)</figure></div>', "Singleline,IgnoreCase")
  foreach ($match in $statMatches) {
    $statHtml = $match.Groups["html"].Value
    $title = Remove-HtmlTags ([regex]::Match($statHtml, '<div class="statTitle">(?<value>.*?)</div>', "Singleline,IgnoreCase").Groups["value"].Value)
    $comparison = Normalize-Comparison ([regex]::Match($statHtml, '<p class="statComparison">(?<value>.*?)</p>', "Singleline,IgnoreCase").Groups["value"].Value)
    $key = $title.ToLowerInvariant()

    if (-not [string]::IsNullOrWhiteSpace($key)) {
      $stats[$key] = [pscustomobject]@{
        value = Get-StatValue $statHtml
        comparison = $comparison
      }
    }
  }

  return $stats
}

$resolvedRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$resolvedOutputPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath
} else {
  Join-Path $resolvedRoot $OutputPath
}

$response = Invoke-WebRequest -Uri $SourceUrl -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
$html = $response.Content

if ($html -match "<title>\s*Just a moment") {
  throw "RI Realtors returned a Cloudflare challenge page instead of market data."
}

$sectionMatch = [regex]::Match($html, '<section class="quickStatsComponent[\s\S]*?Recent Market Trends[\s\S]*?</section>', "Singleline,IgnoreCase")
if (-not $sectionMatch.Success) {
  throw "Could not find the RI Realtors Recent Market Trends section."
}

$sectionHtml = $sectionMatch.Value
$periodRaw = Remove-HtmlTags ([regex]::Match($sectionHtml, '<div class="eyebrow center">(?<value>.*?)</div>', "Singleline,IgnoreCase").Groups["value"].Value)
$stats = Get-QuickStatMap $sectionHtml

$median = $stats["median sales price"]
$sold = $stats["no. of homes sold"]
$pending = $stats["no. of pending sales"]
$inventory = $stats["active inventory"]

if ([string]::IsNullOrWhiteSpace($periodRaw) -or $null -eq $median -or $null -eq $sold -or $null -eq $pending -or $null -eq $inventory) {
  throw "Could not parse one or more required RI market metrics."
}

$state = [ordered]@{
  periodLabel = Format-MarketPeriod $periodRaw
  medianSalesPrice = $median.value
  medianSalesPriceTrend = $median.comparison
  homesSold = $sold.value
  homesSoldTrend = $sold.comparison
  pendingSales = $pending.value
  pendingSalesTrend = $pending.comparison
  activeInventory = $inventory.value
  activeInventoryTrend = $inventory.comparison
  sourceUrl = $SourceUrl
  fetchedAt = [DateTimeOffset]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'", [Globalization.CultureInfo]::InvariantCulture)
}

if (Test-Path -LiteralPath $resolvedOutputPath) {
  try {
    $existing = Get-Content -Raw -LiteralPath $resolvedOutputPath | ConvertFrom-Json
    $comparisonFields = @(
      "periodLabel",
      "medianSalesPrice",
      "medianSalesPriceTrend",
      "homesSold",
      "homesSoldTrend",
      "pendingSales",
      "pendingSalesTrend",
      "activeInventory",
      "activeInventoryTrend",
      "sourceUrl"
    )
    $hasDataChanges = $false
    foreach ($field in $comparisonFields) {
      if ([string]$existing.$field -ne [string]$state[$field]) {
        $hasDataChanges = $true
        break
      }
    }

    if (-not $hasDataChanges -and -not [string]::IsNullOrWhiteSpace($existing.fetchedAt)) {
      $state["fetchedAt"] = $existing.fetchedAt
    }
  } catch {
    Write-Warning "Could not compare existing RI market data. Rewriting feed."
  }
}

$outputDirectory = Split-Path -Parent $resolvedOutputPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$json = $state | ConvertTo-Json -Depth 4
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($resolvedOutputPath, "$json`n", $utf8NoBom)
Write-Host "Wrote RI market data to $resolvedOutputPath"
