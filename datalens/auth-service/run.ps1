param(
    [switch]$RecreateVenv = $false,
    [int]$Port = 8000
)

Set-Location $PSScriptRoot

# Crear o recrear entorno virtual
if ($RecreateVenv -or -not (Test-Path ".venv")) {
    if (Test-Path ".venv") {
        Remove-Item -Recurse -Force ".venv"
    }
    py -3.12 -m venv .venv
}

# Activar entorno virtual
. .\.venv\Scripts\Activate.ps1

# Instalar dependencias
python -m pip install --upgrade pip
python -m pip install "pymongo[srv]==3.12"
python -m pip install -r requirements.txt

# Ejecutar el servicio
uvicorn main:app --reload --port $Port