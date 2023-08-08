#include "classes/Logger.cpp"

int main(){
	Logger* logger = new Logger("Main Process");

	logger->Log(INFO, "This is a INFO message!");
	logger->Log(WARNING, "This is a WARNING message!");
	logger->Log(ERROR, "This is a ERROR message!");
	return 0;
}