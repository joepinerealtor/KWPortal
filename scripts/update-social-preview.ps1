param(
  [string]$RepositoryRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Get-BrowserPath {
  $candidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  )

  return $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

function Get-ImageSize {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  Add-Type -AssemblyName System.Drawing
  $image = [System.Drawing.Image]::FromFile($Path)

  try {
    return @{
      Width = $image.Width
      Height = $image.Height
    }
  } finally {
    $image.Dispose()
  }
}

function Update-MetaTag {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Content,
    [Parameter(Mandatory = $true)]
    [string]$Pattern,
    [Parameter(Mandatory = $true)]
    [string]$Replacement
  )

  if (-not [regex]::IsMatch($Content, $Pattern)) {
    throw "Could not find expected meta tag pattern: $Pattern"
  }

  return [regex]::Replace($Content, $Pattern, $Replacement)
}

$resolvedRoot = (Resolve-Path $RepositoryRoot).Path
Set-Location $resolvedRoot

$browserPath = Get-BrowserPath
if (-not $browserPath) {
  throw "Chrome or Edge was not found. Install one of them to refresh the social preview."
}

$indexPath = Join-Path $resolvedRoot "index.html"
$previewImagePath = Join-Path $resolvedRoot "images\social-preview-login.png"
$previewPages = @(
  (Join-Path $resolvedRoot "index.html"),
  (Join-Path $resolvedRoot "brand-assets.html"),
  (Join-Path $resolvedRoot "login-screen-preview.html")
)

$tempImagePath = Join-Path ([System.IO.Path]::GetTempPath()) ("kwportal-social-preview-" + [System.Guid]::NewGuid().ToString("N") + ".png")
$pageUri = [System.Uri]::new((Resolve-Path $indexPath).Path).AbsoluteUri + "?portalLock=1"
$viewportWidth = 1893
$viewportHeight = 919

try {
  & $browserPath `
    "--headless=new" `
    "--disable-gpu" `
    "--hide-scrollbars" `
    "--force-device-scale-factor=1" `
    "--window-size=$viewportWidth,$viewportHeight" `
    "--virtual-time-budget=5000" `
    "--screenshot=$tempImagePath" `
    $pageUri | Out-Null

  if (-not (Test-Path $tempImagePath)) {
    throw "The browser did not create a social preview screenshot."
  }

  $tempHash = (Get-FileHash $tempImagePath -Algorithm SHA256).Hash.ToLowerInvariant()
  $version = $tempHash.Substring(0, 12)

  $needsImageUpdate = -not (Test-Path $previewImagePath)
  if (-not $needsImageUpdate) {
    $currentHash = (Get-FileHash $previewImagePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $needsImageUpdate = $currentHash -ne $tempHash
  }

  if ($needsImageUpdate) {
    Copy-Item -LiteralPath $tempImagePath -Destination $previewImagePath -Force
  }

  $imageSize = Get-ImageSize -Path $previewImagePath
  $publicImageUrl = "https://portal.kwleadingedge.com/images/social-preview-login.png?v=$version"

  foreach ($page in $previewPages) {
    $content = Get-Content -LiteralPath $page -Raw
    $content = Update-MetaTag -Content $content -Pattern '<meta property="og:image" content="[^"]+">' -Replacement "<meta property=`"og:image`" content=`"$publicImageUrl`">"
    $content = Update-MetaTag -Content $content -Pattern '<meta name="twitter:image" content="[^"]+">' -Replacement "<meta name=`"twitter:image`" content=`"$publicImageUrl`">"
    $content = Update-MetaTag -Content $content -Pattern '<meta property="og:image:width" content="[^"]+">' -Replacement "<meta property=`"og:image:width`" content=`"$($imageSize.Width)`">"
    $content = Update-MetaTag -Content $content -Pattern '<meta property="og:image:height" content="[^"]+">' -Replacement "<meta property=`"og:image:height`" content=`"$($imageSize.Height)`">"
    Set-Content -LiteralPath $page -Value $content
  }

  Write-Host "Social preview refreshed."
  Write-Host "Image: $previewImagePath"
  Write-Host "Version: $version"
  Write-Host "Size: $($imageSize.Width)x$($imageSize.Height)"
} finally {
  if (Test-Path $tempImagePath) {
    Remove-Item -LiteralPath $tempImagePath -Force
  }
}
