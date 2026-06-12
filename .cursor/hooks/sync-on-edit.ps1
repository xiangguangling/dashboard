$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $RepoRoot 'scripts\sync-to-github.ps1') -Once
exit 0
