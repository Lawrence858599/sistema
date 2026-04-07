Param(
  [switch]$SkipFrontend,
  [switch]$SkipBackend
)

$ErrorActionPreference = "Stop"

function Run-Step($Title, $ScriptBlock) {
  Write-Host ""
  Write-Host "==> $Title"
  & $ScriptBlock
}

function Assert-LastExitCode($Context) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Context falhou (exit code $LASTEXITCODE)."
  }
}

if (-not $SkipBackend) {
  Run-Step "Backend: compile + testes" {
    Push-Location "backend"
    try {
      $python = ".\.venv\Scripts\python.exe"
      if (-not (Test-Path $python)) { $python = "python" }

      & $python -m py_compile (Get-ChildItem -Recurse -File app -Filter *.py | ForEach-Object { $_.FullName })
      Assert-LastExitCode "py_compile"

      try {
        & $python -m pytest -q -p no:cacheprovider
        Assert-LastExitCode "pytest"
      } catch {
        Write-Host "pytest falhou ou nao esta instalado. Instale dev deps: pip install -r requirements.txt -r requirements-dev.txt"
        throw
      }
    } finally {
      Pop-Location
    }
  }
}

if (-not $SkipFrontend) {
  Run-Step "Frontend: testes + build" {
    Push-Location "frontend"
    try {
      if (-not (Test-Path "node_modules")) {
        Write-Host "node_modules nao encontrado. Rode: npm install"
        throw "Dependencias do frontend ausentes."
      }

      npm run test:run
      Assert-LastExitCode "frontend tests"

      npm run build
      Assert-LastExitCode "frontend build"
    } finally {
      Pop-Location
    }
  }
}

Write-Host ""
Write-Host "OK: checks passaram."