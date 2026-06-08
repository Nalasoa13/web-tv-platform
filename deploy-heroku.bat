@echo off
REM Script de déploiement Heroku pour Web TV Platform (Windows)
REM Usage: deploy-heroku.bat

setlocal enabledelayedexpansion

set APP_NAME=webtv-rua
set EMAIL=rianalarabe13@gmail.com
set ENVIRONMENT=production

echo.
echo ========================================
echo   Web TV Platform - Heroku Deployment
echo ========================================
echo.
echo App: %APP_NAME%
echo Email: %EMAIL%
echo Environment: %ENVIRONMENT%
echo.

REM Vérifier Heroku CLI
where heroku >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Heroku CLI n'est pas installé
    echo Télécharger: https://cli-assets.heroku.com/heroku-x64.exe
    pause
    exit /b 1
)

REM Vérifier Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git n'est pas installé
    pause
    exit /b 1
)

echo [1/8] Configuration Git...
git config user.email "%EMAIL%"
git config user.name "Rian Alarabe"

echo [2/8] Initialisation du repository...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit: Web TV Platform"
) else (
    echo Repository Git déjà initialisé
)

echo [3/8] Connexion à Heroku...
heroku login

echo [4/8] Création de l'application Heroku...
heroku create %APP_NAME% 2>nul
if %errorlevel% neq 0 (
    echo Application %APP_NAME% existe déjà
)

echo [5/8] Ajout de PostgreSQL...
heroku addons:create heroku-postgresql:hobby-dev --app=%APP_NAME% 2>nul

echo [6/8] Configuration des buildpacks...
heroku buildpacks:clear --app=%APP_NAME%
heroku buildpacks:add heroku/nodejs --app=%APP_NAME%
heroku buildpacks:add heroku/static --app=%APP_NAME%

echo [7/8] Configuration des variables d'environnement...
heroku config:set NODE_ENV=%ENVIRONMENT% --app=%APP_NAME%
heroku config:set JWT_SECRET=your-secret-key-change-this --app=%APP_NAME%
heroku config:set FRONTEND_URL=https://%APP_NAME%.herokuapp.com --app=%APP_NAME%
heroku config:set HLS_URL=https://%APP_NAME%.herokuapp.com/hls --app=%APP_NAME%

echo [8/8] Déploiement du code...
heroku git:remote --app=%APP_NAME%
git push heroku master

echo.
echo ========================================
echo   Déploiement réussi!
echo ========================================
echo.
echo URL: https://%APP_NAME%.herokuapp.com
echo.
echo Exécution des migrations...
heroku run npm run migrate --prefix backend --app=%APP_NAME%

echo.
echo Ouverture de l'application...
heroku open --app=%APP_NAME%

pause
