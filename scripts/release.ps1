param(
    [Parameter(Position=0)]
    [ValidateSet("patch", "minor", "major", "custom")]
    [string]$Type = "patch",

    [Parameter(Position=1)]
    [string]$CustomVersion = ""
)

$ErrorActionPreference = "Stop"

$pkgPath = "web/package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$current = [version]$pkg.version

if ($Type -eq "custom") {
    if (-not $CustomVersion) {
        Write-Error "Custom versiya kiritilmadi. Masalan: ./scripts/release.ps1 custom 1.2.0"
    }
    $next = $CustomVersion
} elseif ($Type -eq "major") {
    $next = "$($current.Major + 1).0.0"
} elseif ($Type -eq "minor") {
    $next = "$($current.Major).$($current.Minor + 1).0"
} else {
    $next = "$($current.Major).$($current.Minor).$($current.Build + 1)"
}

Write-Host "Yangi versiya: $next (avvalgisi: $($pkg.version))" -ForegroundColor Cyan

# Update package.json
$pkg.version = $next
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8

# Git commit & tag
$tag = "v$next"
git add .
git commit -m "release: $tag - versiya yangilandi"
git tag -a $tag -m "Release $tag"

Write-Host "GitHub repozitoriysiga yuklanmoqda ($tag)..." -ForegroundColor Yellow
git push origin main --tags

Write-Host "Muvaffaqiyatli yakunlandi! Versiya: $tag" -ForegroundColor Green
