$ErrorActionPreference = 'Stop'
$runtime = Join-Path $PSScriptRoot '../runtime'
$manifest = Get-Content -Raw (Join-Path $PSScriptRoot '../runtime-lock.json') | ConvertFrom-Json
$savedJava = $env:JAVA
$savedTlc = $env:TLA2TOOLS
$code = 2
try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Node.js 24 or later is required. Install Node.js and reopen your terminal.'
    }
    if (-not $env:TLA2TOOLS) { $env:TLA2TOOLS = Join-Path $runtime 'tla2tools.jar' }
    if (-not $env:JAVA) { $env:JAVA = Join-Path $runtime ('java/' + $manifest.java.directory + '/bin/java.exe') }
    if (-not (Test-Path -LiteralPath $env:TLA2TOOLS) -or -not (Get-Command $env:JAVA -ErrorAction SilentlyContinue)) {
        throw "Runtime missing. Run: & `"$PSScriptRoot/setup-runtime.ps1`""
    }
    & node (Join-Path $PSScriptRoot 'statechart.ts') @args
    $code = $LASTEXITCODE
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    $code = 2
} finally {
    $env:JAVA = $savedJava
    $env:TLA2TOOLS = $savedTlc
}
exit $code
