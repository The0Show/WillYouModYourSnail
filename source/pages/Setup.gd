extends Control

var currentStep = 0

@export var step_titles = [
	"Welcome",
	"Will You Snail Location",
	"Setup Complete"
]

@onready var steps = $StepContainer.get_children().size()-1

# Called when the node enters the scene tree for the first time.
func _ready():
	for child in $StepContainer.get_children():
		child.visible = false
	
	$StepContainer.get_children()[currentStep].visible = true
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	$HBoxContainer/BackButton.disabled = currentStep == 0 or currentStep == steps

	match currentStep:
		1:
			$HBoxContainer/NextButton.disabled = UserConfigFile.config.gamePath == ""
		steps:
			$HBoxContainer/NextButton.disabled = true
		_:
			$HBoxContainer/NextButton.disabled = false
	pass

func _on_next_button_pressed():
	$StepContainer.get_children()[currentStep].visible = false
	currentStep += 1
	$StepContainer.get_children()[currentStep].visible = true
	Globals.page_title = step_titles[currentStep]
	pass # Replace with function body.

func _on_back_button_pressed():
	$StepContainer.get_children()[currentStep].visible = false
	currentStep -= 1
	$StepContainer.get_children()[currentStep].visible = true
	Globals.page_title = step_titles[currentStep]
	pass # Replace with function body.

func _on_finished_step_visibility_changed():
	UserConfigFile.config.setupComplete = true
	UserConfigFile.writeConfig()
	pass # Replace with function body.

func _on_open_file_picker_pressed():
	$StepContainer/LocateWYS/LocateWYSDialog.popup()
	pass # Replace with function body.

func _on_locate_wys_dialog_file_selected(path):
	UserConfigFile.config.gamePath = path
	_on_locate_wys_visibility_changed()
	pass # Replace with function body.

func _on_locate_wys_visibility_changed():
	$StepContainer/LocateWYS/HBoxContainer/LineEdit.text = UserConfigFile.config.gamePath
	pass # Replace with function body.
