@echo off
echo Clearing Next.js cache and rebuilding...
echo.

echo Step 1: Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo Step 2: Removing .next directory...
if exist .next rmdir /s /q .next

echo Step 3: Removing node_modules/.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Step 4: Reinstalling dependencies...
call npm install

echo.
echo ✅ Cache cleared! Now run: npm run dev
echo.
pause
