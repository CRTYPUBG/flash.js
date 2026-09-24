@echo off
setlocal EnableDelayedExpansion
REM ============================================================
REM  FLASH.js  ->  https://github.com/CRTYPUBG/flash.js.git
REM  Windows ENV: GITHUB_TOKEN  (setx GITHUB_TOKEN "ghp_xxx"  or  set GITHUB_TOKEN=xxx)
REM ============================================================

if "%GITHUB_TOKEN%"=="" (
  echo [HATA] GITHUB_TOKEN bos. Windows ENV ayarla:
  echo   setx GITHUB_TOKEN "ghp_xxxxxxxxxxxxxxxxxxxx"
  echo   sonra yeni terminal ac ve tekrar dene
  echo   veya bu oturum icin: set GITHUB_TOKEN=ghp_xxx
  exit /b 1
)

REM git kontrol
where git >nul 2>nul
if errorlevel 1 (
  echo [HATA] git bulunamadi. Git for Windows kurulu mu?
  exit /b 1
)

REM repo kokunde oldugumuzu garanti et (upload.bat'in bulundugu klasor)
pushd "%~dp0"

REM ilk kurulum: .git yoksa init
if not exist ".git" (
  echo [INFO] .git yok, init yapiliyor...
  git init
  git branch -M main
)

REM remote ayarla (token'i URL'e gom, log'a yazma)
git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/CRTYPUBG/flash.js.git

REM .gitignore zaten var, node_modules/dist map haric tutuluyor
echo [INFO] add...
git add .

REM degisiklik var mi kontrol et
git diff --cached --quiet
if %errorlevel%==0 (
  echo [INFO] commit edilecek degisiklik yok.
) else (
  for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set dt=%%I
  set dt=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%
  git commit -m "chore: publish %dt% [skip ci]"
  if errorlevel 1 (
    echo [HATA] commit basarisiz
    popd
    exit /b 1
  )
)

echo [INFO] push origin main...
git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo [HATA] push basarisiz. Olası nedenler:
  echo  - GITHUB_TOKEN yanlis / suresi dolmus / repo yetkisi yok
  echo  - remote'da farkli history var ise: git push -u origin main --force  deneyin
  popd
  exit /b 1
)

echo.
echo [OK] https://github.com/CRTYPUBG/flash.js push basarili
popd
endlocal
