@echo off
echo ============================================
echo  InkSpace Blog — 启动脚本
echo ============================================
echo.

echo [1/2] 启动后端 (Spring Boot + H2)...
cd /d D:\blog\blog-backend
start "BlogBackend" cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2"
echo 后端正在启动，等待20秒...

timeout /t 20 /nobreak >nul

echo [2/2] 启动前端 (Next.js)...
cd /d D:\blog\blog-frontend
start "BlogFrontend" cmd /c "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo  启动完成！
echo  前端: http://localhost:3000
echo  后端: http://localhost:8080
echo  H2控制台: http://localhost:8080/h2-console
echo.
echo  默认账号: admin / admin123
echo ============================================
echo.
echo 按任意键测试登录API...
pause >nul

echo.
echo 测试登录API...
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
echo.
pause
