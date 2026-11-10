[CmdletBinding()]
param([switch]$Development)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if ($env:OS -ne 'Windows_NT' -or $env:PROCESSOR_ARCHITECTURE -ne 'AMD64') {
    throw 'This runtime installer supports native Windows x64 only.'
}
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw 'Install Node.js 24 or later (including npm), then reopen the terminal.'
}
$major = & node -p 'parseInt(process.versions.node)'
if ($LASTEXITCODE -ne 0 -or [int]$major -lt 24) { throw 'Node.js 24 or later is required.' }

$manifest = Get-Content -Raw (Join-Path $PSScriptRoot '../runtime-lock.json') | ConvertFrom-Json
$runtime = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../runtime'))
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$staging = Join-Path $runtime ('.setup-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null

function Get-VerifiedDownload($Entry, [string]$Destination) {
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            Invoke-WebRequest -UseBasicParsing -Uri $Entry.url -OutFile $Destination
            break
        } catch {
            if ($attempt -eq 3) { throw }
            Start-Sleep -Seconds 1
        }
    }
    if ((Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash -ne $Entry.sha256) {
        throw "SHA256 mismatch for $Destination. No downloaded executable will be used."
    }
}

try {
    $javaRoot = Join-Path $runtime 'java'
    $java = Join-Path $javaRoot ($manifest.java.directory + '/bin/java.exe')
    if (-not (Test-Path -LiteralPath $java)) {
        Write-Output "Installing Temurin JRE $($manifest.java.version)..."
        $archive = Join-Path $staging 'java.zip'
        Get-VerifiedDownload $manifest.java $archive
        $extracted = Join-Path $staging 'java'
        Expand-Archive -LiteralPath $archive -DestinationPath $extracted
        New-Item -ItemType Directory -Force -Path $javaRoot | Out-Null
        Copy-Item -LiteralPath (Join-Path $extracted $manifest.java.directory) -Destination $javaRoot -Recurse -Force
    }
    if (-not (Test-Path -LiteralPath $java)) { throw 'The JRE archive did not contain the expected java.exe.' }

    $jar = Join-Path $runtime 'tla2tools.jar'
    if (-not (Test-Path -LiteralPath $jar) -or (Get-FileHash -LiteralPath $jar -Algorithm SHA256).Hash -ne $manifest.tlc.sha256) {
        Write-Output "Installing TLC $($manifest.tlc.version)..."
        $download = Join-Path $staging 'tla2tools.jar'
        Get-VerifiedDownload $manifest.tlc $download
        Copy-Item -LiteralPath $download -Destination $jar -Force
    }
    Write-Output 'Installing locked npm dependencies...'
    $npmArgs = @('ci', '--prefix', $PSScriptRoot, '--ignore-scripts', '--no-audit', '--no-fund')
    if (-not $Development) { $npmArgs += '--omit=dev' }
    & npm.cmd @npmArgs
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. Fix the reported error and rerun this script.' }
    Write-Output 'Runtime ready. Invoke statechart.ps1 to check a model.'
} finally {
    # Delete only this invocation's staging directory inside the skill runtime.
    $resolved = [IO.Path]::GetFullPath($staging)
    if (-not $resolved.StartsWith($runtime + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing cleanup outside the runtime directory.'
    }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
