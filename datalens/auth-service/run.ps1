param([switch]$RecreateVenv=$false,[int]$Port=8000)
Set-Location $PSScriptRoot
$pythonCmd="python";try{$py=& py -0p 2>$null;if($py -match "3.12"){$pythonCmd="py -3.12"}}catch{}
if($RecreateVenv -or -not (Test-Path "..venv")){if(Test-Path "..venv"){Remove-Item -Recurse -Force "..venv"};Invoke-Expression "$pythonCmd -m venv .venv"}
. ..venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r requirements.txt
python -m pip install -U email-validator
python -m uvicorn main:app --reload --reload-dir . --port $Port
