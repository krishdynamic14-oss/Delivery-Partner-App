$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')
$androidDir = Join-Path $projectRoot 'android'
$gradlew = Join-Path $androidDir 'gradlew.bat'
$apkPath = Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
$javaHome = 'C:\Program Files\Android\Android Studio\jbr'
$androidHome = Join-Path $env:LOCALAPPDATA 'Android\Sdk'

if (-not (Test-Path -LiteralPath $gradlew)) {
  throw "Android project not found. Run `npx expo prebuild --platform android` once before local APK builds."
}

if (-not (Test-Path -LiteralPath (Join-Path $javaHome 'bin\java.exe'))) {
  throw "Android Studio JBR Java not found at $javaHome"
}

if (-not (Test-Path -LiteralPath $androidHome)) {
  throw "Android SDK not found at $androidHome"
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:NODE_ENV = 'production'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

Write-Host "Building standalone release APK..."
Write-Host "Project: $projectRoot"

Push-Location $androidDir
try {
  & cmd /c gradlew.bat --no-daemon assembleRelease
} finally {
  Pop-Location
}

if (-not (Test-Path -LiteralPath $apkPath)) {
  throw "Build finished but APK was not found at $apkPath"
}

$apk = Get-Item -LiteralPath $apkPath
Write-Host ""
Write-Host "APK ready:"
Write-Host $apk.FullName
Write-Host ("Size: {0:N1} MB" -f ($apk.Length / 1MB))
