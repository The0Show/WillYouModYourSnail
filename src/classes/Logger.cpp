#include <string>
#include <iostream>

#define stringify( name ) #name
using namespace std;

enum LogLevel {
	INFO,
	WARNING,
	ERROR,
	DEBUG,
	VERBOSE
};

class Logger {
	public:
		string prefix;
		Logger(string prefix){
			this->prefix = prefix;

			this->Log(INFO, "Logger initialized");
		}

		void Log(LogLevel level, string msg){
			switch (level)
			{
				case INFO:
				case WARNING:
				case DEBUG:
				case VERBOSE:
					cout << constructPrefix(level);
					cout << msg << endl;
					break;

				case ERROR:
					cerr << constructPrefix(level);
					cerr << msg << endl;
					break;
				
				default:
					break;
			}
		}

		void Info(string msg){
			this->Log(INFO, msg);
		}
		void Warn(string msg){
			this->Log(WARNING, msg);
		}
		void Error(string msg){
			this->Log(ERROR, msg);
		}
		void Debug(string msg){
			this->Log(DEBUG, msg);
		}
		void Verbose(string msg){
			this->Log(VERBOSE, msg);
		}
	private:
		string constructPrefix(LogLevel level){
			return "[" + prefix + "] ";
		}
};