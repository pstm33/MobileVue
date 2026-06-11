param(
    [string]$ServerHost = "192.168.1.21",
    [string]$User = "ps",
    [string]$RemoteDir = "/var/www/fastuser/data/www/app.tagam.app",
    [string]$LocalDistDir = "dist/pwa",
    [string]$KeyFile = "",
    [string]$Password = "",
    [switch]$NoBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Import-Module Posh-SSH -ErrorAction SilentlyContinue

if ($Password -and -not (Get-Module -Name Posh-SSH)) {
    throw "Posh-SSH module is not available for password-based deploy. Install it or use key-based KeyFile mode."
}

$credential = $null
$sshSession = $null

if ($Password) {
    $securePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($User, $securePassword)
}

function Invoke-Ssh {
    param([string]$Command)
    if ($Password) {
        $result = Invoke-SSHCommand -SSHSession $sshSession -Command $Command -ErrorAction Stop
    if ($result.ExitStatus -ne 0) {
            $statusText = if ($result.ExitStatus -is [array]) { ($result.ExitStatus -join ",") } else { "$($result.ExitStatus)" }
            throw "Remote command failed: ${Command} (exit status ${statusText})"
        }
        return $result
    }

    $args = @("ssh")
    if ($KeyFile) {
        $args += "-i"
        $args += $KeyFile
    }
    $args += "-o"
    $args += "StrictHostKeyChecking=accept-new"
    $args += "$User@$ServerHost"
    $args += $Command
    & @args
    if ($LASTEXITCODE -ne 0) {
      throw "SSH command failed with exit code $($LASTEXITCODE): ${Command}"
    }
}

function Invoke-Scp {
    param([string[]]$Paths, [string]$Destination)
    if ($Password) {
        if (-not (Test-Path $Destination)) {
            Invoke-Ssh "mkdir -p '$Destination'"
        }
        $rootPath = (Resolve-Path $Paths).Path.TrimEnd('\', '/')
        $files = Get-ChildItem -Path $Paths -Recurse -File
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($rootPath.Length).TrimStart('\', '/')
            $relativeDir = [System.IO.Path]::GetDirectoryName($relativePath)
            if ([string]::IsNullOrWhiteSpace($relativeDir)) {
                $remoteFileDir = $Destination
            }
            else {
                $remoteFileDir = ($Destination + "/" + ($relativeDir -replace '\\', '/'))
                Invoke-Ssh "mkdir -p '$remoteFileDir'"
            }
            Set-SCPItem -Path $file.FullName -Destination $remoteFileDir -ComputerName $ServerHost -Credential $credential -AcceptKey -Force -ErrorAction Stop
        }
        return
    }

    $args = @("scp", "-r")
    if ($KeyFile) {
        $args += "-i"
        $args += $KeyFile
    }
    $args += "-o"
    $args += "StrictHostKeyChecking=accept-new"
    $args += $Paths
    $args += "$User@$ServerHost`:$Destination"
    & @args
    if ($LASTEXITCODE -ne 0) {
      throw "SCP command failed with exit code $LASTEXITCODE"
    }
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$LocalDist = Join-Path $root.Path $LocalDistDir

if (-not (Test-Path $LocalDist)) {
  throw "Local build folder not found: $LocalDist"
}

if (-not $NoBuild) {
  Write-Host "Running npm run build:pwa ..."
  & npm run build:pwa
}

if ($DryRun) {
  Write-Host "DryRun enabled: no remote connection will be performed."
  Write-Host "Would upload: $LocalDist"
  Write-Host "To host: ${User}@${ServerHost}:${RemoteDir}"
  exit 0
}

try {
    if ($Password) {
        Write-Host "Connecting to $User@$ServerHost using Posh-SSH password mode ..."
        $sshSession = New-SSHSession -ComputerName $ServerHost -Credential $credential -AcceptKey -Force -ErrorAction Stop
    }
    else {
        $sshSession = $null
    }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$remoteTmp = "/tmp/tagam-pwa-${timestamp}"

    Write-Host "Preparing remote folder ..."
    Invoke-Ssh "mkdir -p '$remoteTmp'"

    Write-Host "Uploading dist/pwa to $remoteTmp ..."
    Invoke-Scp -Paths $LocalDist -Destination $remoteTmp

    Write-Host "Deploying to $RemoteDir ..."
    Invoke-Ssh "set -e; mkdir -p '$RemoteDir'; cd '$RemoteDir'; find . -mindepth 1 -delete; cp -r '$remoteTmp'/./* .; rm -rf '$remoteTmp'"

Write-Host "Deployed. Verify quickly:"
Write-Host "  https://app.tagam.app/manifest.json"
Write-Host "  https://app.tagam.app/service-worker.js"
Write-Host "  https://app.tagam.app/sw.js"
}
finally {
    if ($sshSession) {
        Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
    }
}
