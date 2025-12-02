param(
    [switch]$RecreateVenv = $false,
    [int]$Port = 8004
)

Write-Host "Iniciando analytics-service..." -ForegroundColor Cyan

Set-Location $PSScriptRoot

# ===============================================================
# 1) RECREAR ENTORNO VIRTUAL SI ES NECESARIO
# ===============================================================

if ($RecreateVenv -or -not (Test-Path ".venv")) {
    Write-Host "Creando entorno virtual con Python 3.12..." -ForegroundColor Yellow

    if (Test-Path ".venv") {
        Remove-Item -Recurse -Force ".venv"
    }

    # Fuerza a crear venv con Python 3.12
    py -3.12 -m venv .venv
}

# ===============================================================
# 2) ACTIVAR VENV
# ===============================================================

Write-Host "Activando entorno virtual..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

# Verificar versión correcta
$pyVersion = python --version
Write-Host "Python en uso: $pyVersion" -ForegroundColor Green

if ($pyVersion -notlike "*3.12*") {
    Write-Host "⚠️ ERROR: El entorno virtual NO usa Python 3.12." -ForegroundColor Red
    Write-Host "Solución: instala Python 3.12 y vuelve a ejecutar run.ps1 -RecreateVenv" -ForegroundColor Yellow
    exit 1
}

# ===============================================================
# 3) INSTALAR DEPENDENCIAS
# ===============================================================

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
python -m pip install --upgrade pip
python -m pip install "pymongo[srv]==3.12"
python -m pip install -r requirements.txt

# ===============================================================
# 4) LEVANTAR SERVICIO USANDO EL PYTHON DEL VENV
# ===============================================================

Write-Host "Levantando analytics-service en puerto $Port ..." -ForegroundColor Green

python -m uvicorn main:app --reload --port $Port