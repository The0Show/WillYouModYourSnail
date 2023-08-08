#include "classes/Logger.cpp"
#include "../lib/raylib-cpp/include/raylib-cpp.hpp"

int main(){
	Logger* logger = new Logger("Main Process");

	logger->Log(INFO, "Checking for updates...");

	// update checking code goes here or something

	logger->Log(INFO, "No updates found!");
	logger->Log(INFO, "Initializing window...");

	raylib::Window window(400,400, "Will You Mod Your Snail");
	SetTargetFPS(60);

    while (!window.ShouldClose())
    {
        BeginDrawing();

        window.ClearBackground(RAYWHITE);

        EndDrawing();
    }

	return 0;
}