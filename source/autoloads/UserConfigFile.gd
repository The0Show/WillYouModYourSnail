extends Node

var file: FileAccess

var config = {
	"version": 0,
	"gamePath": "",
	"setupComplete": false,
	"mods": []
}

func _ready():
	if(FileAccess.file_exists("user://Config.bin")):
		file = FileAccess.open("user://Config.bin", FileAccess.READ)
		
		var incomingConfig = file.get_var(true)
		file.close()
		for key in incomingConfig.keys():
			config[key] = incomingConfig[key]
	
	writeConfig()

func writeConfig():
	file = FileAccess.open("user://Config.bin", FileAccess.WRITE)
	file.store_var(config, true)
	file.close()
