$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot 'Backend'
$bdLogicDir = Join-Path $repoRoot 'BD_Logic'
$aimlDir = Join-Path $repoRoot 'AIML_CV'
$frontendDir = Join-Path $repoRoot 'Frontend'

function Start-ServiceWindow {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Command
    )

    Write-Host "Starting $Name in new terminal..."
    Start-Process pwsh -ArgumentList '-NoExit', '-WorkingDirectory', $WorkingDirectory, '-Command', $Command
}

Start-ServiceWindow -Name 'Backend' -WorkingDirectory $backendDir -Command 'python -m uvicorn main:app --host 127.0.0.1 --port 8000'
Start-ServiceWindow -Name 'BD_Logic' -WorkingDirectory $repoRoot -Command 'python -m uvicorn BD_Logic.main:app --host 127.0.0.1 --port 8002 --reload'
Start-ServiceWindow -Name 'AIML_CV' -WorkingDirectory $aimlDir -Command 'python main.py'
Start-ServiceWindow -Name 'Frontend' -WorkingDirectory $frontendDir -Command 'npm run dev -- --host 0.0.0.0 --port 3000'

Write-Host 'All service windows launched. Backend=8000, BD_Logic=8002, AIML=8001, Frontend=3000.'
