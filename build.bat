@echo off
cmake . -B ./bin
cd bin
make
cd ..
pause
@echo on