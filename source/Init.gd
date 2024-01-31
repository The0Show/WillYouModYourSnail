extends Control

var tween
var hamburgerMenuNavIndexes = 1 # controls which menu items get disabled if setup is not completed

# Called when the node enters the scene tree for the first time.
func _ready():
	$CanvasLayer.visible = true
	$CanvasLayer/Splash/Logo.self_modulate = Color(1,1,1,0)
	
	tween = create_tween()
	tween.tween_property($CanvasLayer/Splash/Logo, "self_modulate", Color(1,1,1,1), 0.73)
	
	$PageTitle/MenuButton.get_popup().connect("id_pressed", _hamburgerPressed)
	
	$CanvasLayer/Splash/Label.text = "Checking UMT version..."
	UndertaleModLib.connect("umt_download", _umt)
	await UndertaleModLib.umt_ready
	
	_switchPage("Setup")
	
	$CanvasLayer/Splash/Label.text = "Ready!" if !tween.is_running() else ""
	if(tween.is_running()):
		await tween.finished
		await get_tree().create_timer(1).timeout
	tween.stop()
	
	$CanvasLayer/Splash.mouse_filter = MOUSE_FILTER_IGNORE
	$CanvasLayer/Splash/Logo.mouse_filter = MOUSE_FILTER_IGNORE
	$CanvasLayer/Splash/Label.mouse_filter = MOUSE_FILTER_IGNORE
	
	tween = create_tween()
	tween.tween_property($CanvasLayer/Splash, "modulate", Color(1,1,1,0), 1)
	
	await tween.finished
	$CanvasLayer.queue_free()
	pass # Replace with function body.

func _umt(status, downloaded, total):
	$CanvasLayer/Splash/Label/ProgressBar.visible = true
	
	$CanvasLayer/Splash/Label.text = status
	$CanvasLayer/Splash/Label/ProgressBar.value = downloaded
	$CanvasLayer/Splash/Label/ProgressBar.max_value = total

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	$PageTitle.text = Globals.page_title
	
	for i in hamburgerMenuNavIndexes:
		$PageTitle/MenuButton.get_popup().set_item_disabled(i, !UserConfigFile.config.setupComplete)
	pass
	
func _switchPage(id):
	var page = load("res://pages/{id}.tscn".format({"id": id})).instantiate()
	page.custom_minimum_size = $ScrollContainer.size
	$ScrollContainer.add_child(page)
	
	if(Globals.active_page):
		Globals.active_page.visible = false
	
	Globals.active_page = page
	Globals.active_page_path = id
	pass

func _hamburgerPressed(index):
	match index:
		1:
			Globals.active_page.queue_free()
			Globals.active_page = null
			
			await get_tree().process_frame
			_switchPage.call_deferred(Globals.active_page_path)
		3:
			get_tree().quit()
		5:
			OS.set_restart_on_exit(true)
			get_tree().quit()

func _on_button_pressed():
	print("poop")
	pass # Replace with function body.
