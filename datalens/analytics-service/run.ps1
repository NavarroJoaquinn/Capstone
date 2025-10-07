# run.ps1 – ejecutor automático del analytics-service

Write-Host "🔍 Comprobando versión de Python disponible..." -ForegroundColor Cyan

# Detecta Python 3.12 si existe
$python312 = & py -0p | Select-String "3.12"

if ($python312) {
    Write-Host "✅ Python 3.12 detectado."
    $python = "py -3.12"
}
else {
    Write-Host "⚠️  Python 3.12 no detectado, se usará la versión por defecto."
    $python = "python"
}

# Moverse a la carpeta del script
Set-Location -Path $PSScriptRoot

# Eliminar .venv si no existe o si está dañado
if (!(Test-Path ".\.venv")) {
    Write-Host "🧱 Creando entorno virtual (.venv)..."
    Invoke-Expression "$python -m venv .venv"
}

# Activar venv
Write-Host "⚙️  Activando entorno virtual..."
. .\.venv\Scripts\Activate.ps1

# Instalar dependencias
Write-Host "📦 Instalando dependencias..."
pip install -U pip
pip install -r requirements.txt

# Ejecutar Uvicorn (watch solo dentro de esta carpeta)
Write-Host "🚀 Iniciando analytics-service en http://127.0.0.1:8100" -ForegroundColor Green
uvicorn app.main:app --reload --reload-dir . --port 8100