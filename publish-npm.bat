@echo off
setlocal
REM ============================================================
REM  FLASH.js  ->  npm publish (registry.npmjs.org)
REM  Windows ENV: NPM_TOKEN  (setx NPM_TOKEN "npm_xxx" kalici)
REM  Token disk'e YAZILMAZ, .npmrc sadece ${NPM_TOKEN} placeholder tutar.
REM  npm publish sirasinda env'den okur.
REM ============================================================

if "%NPM_TOKEN%"=="" (
  echo [HATA] NPM_TOKEN bos. Windows ENV ayarla:
  echo   setx NPM_TOKEN "npm_xxxxxxxxxxxxxxxxxxxx"
  echo   yeni terminal ac, tekrar dene
  exit /b 1
)

pushd "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [HATA] npm bulunamadi.
  popd
  exit /b 1
)

REM .npmrc placeholder (token YOK, sadece referans) - guvenli, commitlenebilir
echo //registry.npmjs.org/:_authToken=${NPM_TOKEN}> .npmrc
echo registry=https://registry.npmjs.org/>> .npmrc

echo [INFO] npm user kontrol...
call npm whoami
if errorlevel 1 (
  echo [HATA] npm auth basarisiz. Token suresi / yetkisi kontrol et.
  popd
  exit /b 1
)

echo [INFO] build...
call npm run build
if errorlevel 1 (
  echo [HATA] build basarisiz.
  popd
  exit /b 1
)

echo [INFO] publish --access public...
call npm publish --access public
if errorlevel 1 (
  echo.
  echo [HATA] publish basarisiz. Olası nedenler:
  echo  - Token READ-ONLY ise: npmjs.com -^> Access Tokens -^> yeni token (Publish yetkili)
  echo  - Granular token ise: "All packages" + Read and write secili olmali
  echo  - E_STAGE_REQUIRED aldiysan: token STAGE-ONLY. Ilk publish direkt token ister,
  echo    stage-only token ile ilk surum basilmaz. Direct publish token ac, 1.0.0 bas,
  echo    sonra stage token kullanabilirsin.
  echo  - Ayni versiyon varsa: package.json version artir (1.0.1)
  popd
  exit /b 1
)

echo.
echo [OK] npm publish basarili. Kontrol: npm view flash.js version
popd
endlocal
