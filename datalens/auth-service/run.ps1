param(
  [switch]$RecreateVenv = $false,
  [int]$Port = 8000
)

Write-Host "🔧 Iniciando auth-service" -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

# 1) Elegir Python (prioriza 3.12)
$pythonCmd = "python"
try {
  $pyList = & py -0p 2>$null
  if ($pyList -match "3\.12") { $pythonCmd = "py -3.12" }
} catch {}

# 2) Recrear venv si se pide o si no existe
if ($RecreateVenv -or -not (Test-Path ".\.venv")) {
  Write-Host "🧱 (Re)creando .venv con $pythonCmd ..."
  if (Test-Path ".\.venv") { Remove-Item -Recurse -Force .\.venv }
  Invoke-Expression "$pythonCmd -m venv .venv"
}

# 3) Activar venv
Write-Host "⚙️  Activando entorno virtual..."
. .\.venv\Scripts\Activate.ps1

# 4) Instalar deps con el python del venv (evita pip de otro lado)
Write-Host "📦 Instalando dependencias..."
python -m pip install -U pip
python -m pip install -r requirements.txt

# 5) Diagnóstico rápido
Write-Host "🔎 Diagnóstico:" -ForegroundColor Yellow
python --version
pip -V
(Get-Command uvicorn).Source

# 6) Lanzar Uvicorn (watch solo esta carpeta)
Write-Host "🚀 auth-service en http://127.0.0.1:$Port" -ForegroundColor Green
uvicorn main:app --reload --reload-dir . --port $Port