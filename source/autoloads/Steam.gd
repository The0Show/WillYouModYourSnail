extends Node

const APP_ID = 1115050

func uninstall():
	OS.shell_open("steam://uninstall/" + str(APP_ID))
