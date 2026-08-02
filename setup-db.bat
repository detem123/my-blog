@echo off
echo ============================================
echo  PostgreSQL + 博客后端 一键配置
echo ============================================
echo.

:: 查找 pg_hba.conf
set "PG_HBA="
if exist "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" set "PG_HBA=C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
if exist "C:\ProgramData\PostgreSQL\18\data\pg_hba.conf" set "PG_HBA=C:\ProgramData\PostgreSQL\18\data\pg_hba.conf"

if "%PG_HBA%"=="" (
    echo [错误] 找不到 pg_hba.conf，请手动找到它
    pause
    exit /b 1
)

echo [1/4] 找到 pg_hba.conf: %PG_HBA%

:: 备份原始文件
copy "%PG_HBA%" "%PG_HBA%.bak" >nul 2>&1

:: 修改认证方式为 trust
powershell -NoProfile -Command ^
  "$content = Get-Content '%PG_HBA%' -Raw; " ^
  "$content = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'; " ^
  "Set-Content '%PG_HBA%' -Value $content -NoNewline"

echo [2/4] pg_hba.conf 已修改（备份: pg_hba.conf.bak）

:: 重启 PostgreSQL
echo [3/4] 重启 PostgreSQL 服务...
net stop postgresql-x64-18 >nul 2>&1
net start postgresql-x64-18 >nul 2>&1
timeout /t 3 /nobreak >nul
echo        服务已重启

:: 创建数据库（无密码）
echo [4/4] 创建数据库 blogdb...
set "PGPASSWORD="
"C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe" -U postgres -c "CREATE DATABASE blogdb;" 2>&1

:: 也试试另一个路径
if %errorlevel% neq 0 (
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE blogdb;" 2>&1
)

echo.
echo ============================================
echo 配置完成！
echo 现在启动后端：
echo   cd D:\blog\blog-backend
echo   mvn spring-boot:run
echo.
echo 然后用 admin / admin123 登录
echo ============================================
pause
