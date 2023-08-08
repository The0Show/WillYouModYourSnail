#include "classes/Logger.cpp"
#include "../lib/raylib/src/raylib.h"

int main(){
	Logger* logger = new Logger("Main Process");

	logger->Log(INFO, "Checking for updates...");

	// update checking code goes here or something

	logger->Log(INFO, "No updates found!");
	logger->Log(INFO, "Initializing window...");

	InitWindow(400,400, "Will You Mod Your Snail");
	SetTargetFPS(60);

    while (!WindowShouldClose())
    {
        BeginDrawing();

        ClearBackground(RAYWHITE);

        EndDrawing();
    }

    CloseWindow();
	return 0;
}