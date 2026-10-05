param([string[]]$Checks = @('startup', 'visual', 'scrollytelling', 'touch-scroll', 'fallbacks', 'camera', 'accessibility', 'entry-readiness', 'entry-handoff', 'supplied-audio'), [string]$Session = 'between')
$ErrorActionPreference = 'Stop'
foreach ($check in $Checks) {
  $ErrorActionPreference = 'Continue'
  $qaOutput = & rtk proxy npx --yes --package '@playwright/cli' playwright-cli "-s=$Session" run-code "--filename=scripts/qa/$check.js" 2>&1
  $qaExit = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  $qaOutput | Set-Content -LiteralPath "output/qa-$check.log" -Encoding utf8
  if ($qaExit -ne 0 -or ($qaOutput -match '^### Error')) {
    $qaOutput | Select-Object -First 14
    throw "Browser check failed: $check"
  }
  Write-Output "$check passed"
  $qaOutput | Select-Object -Skip 1 -First 1
}
