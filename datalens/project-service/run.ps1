param(
    [switch]$RecreateVenv = $false,
    [int]$Port = 8003
)

Set-Location $PSScriptRoot

if ($RecreateVenv -or -not (Test-Path ".venv")) {
    if (Test-Path ".venv") {
        Remove-Item -Recurse -Force ".venv"
    }
    py -3.12 -m venv .venv
}

. .\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
python -m pip install "pymongo[srv]==3.12"
python -m pip install -r requirements.txt

uvicorn main:app --reload --port $Port