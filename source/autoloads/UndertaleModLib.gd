extends Node

var version = null
var output = []

var isDone = false

@onready var http = HTTPClient.new()

signal umt_download(status, downloaded, total)
signal umt_ready

# this is a mess
func downloadUmt():
	var error = http.connect_to_host("https://github.com")

	# Wait until resolved and connected.
	while http.get_status() == HTTPClient.STATUS_CONNECTING or http.get_status() == HTTPClient.STATUS_RESOLVING:
		http.poll()
		emit_signal("umt_download", "Connecting to Github API...", 0, 1)
		await get_tree().process_frame
	
	assert(http.get_status() == HTTPClient.STATUS_CONNECTED)
	
	error = http.request(HTTPClient.METHOD_GET, "/krzys-h/UndertaleModTool/releases/download/bleeding-edge/CLI-windows-latest-Release-isBundled-true.zip", [])
	assert(error == OK)
	
	while http.get_status() == HTTPClient.STATUS_REQUESTING:
		# Keep polling for as long as the request is being processed.
		http.poll()
		emit_signal("umt_download", "Requesting latest UMT object...", 0, 1)
		await get_tree().process_frame
	
	assert(http.get_status() == HTTPClient.STATUS_BODY or http.get_status() == HTTPClient.STATUS_CONNECTED) # Make sure request finished well.

	if http.has_response():
		# If there is a response...
		var headers = http.get_response_headers_as_dictionary()
		assert(http.get_response_code() == 302)
		
		error = http.connect_to_host("https://objects.githubusercontent.com")

		# Wait until resolved and connected.
		while http.get_status() == HTTPClient.STATUS_CONNECTING or http.get_status() == HTTPClient.STATUS_RESOLVING:
			http.poll()
			emit_signal("umt_download", "Connecting to Github Usercontent...", 0, 1)
			await get_tree().process_frame
		
		assert(http.get_status() == HTTPClient.STATUS_CONNECTED)
		
		error = http.request(HTTPClient.METHOD_GET, headers.Location.replace("https://objects.githubusercontent.com", ""), [])
		assert(error == OK)
		
		while http.get_status() == HTTPClient.STATUS_REQUESTING:
			http.poll()
			emit_signal("umt_download", "Requesting object...", 0, 1)
			await get_tree().process_frame
		
		assert(http.get_status() == HTTPClient.STATUS_BODY or http.get_status() == HTTPClient.STATUS_CONNECTED)

		if http.has_response():
			headers = http.get_response_headers_as_dictionary()
			assert(http.get_response_code() == 200)

			var downloaded = 0
			var umtzip = FileAccess.open("user://UMT.zip", FileAccess.WRITE)
			var extrac

			while http.get_status() == HTTPClient.STATUS_BODY:
				http.poll()
				
				var chunk = http.read_response_body_chunk()
				if chunk.size() == 0:
					emit_signal("umt_download", "Downloading latest UMT...", downloaded, http.get_response_body_length())
					await get_tree().process_frame
				else:
					downloaded += chunk.size()
					umtzip.store_buffer(chunk)
			
			umtzip.close()
			
			umtzip = ZIPReader.new()
			umtzip.open("user://UMT.zip")
			var files = umtzip.get_files()
			var prog = 0
			
			emit_signal("umt_download", "Extracting UMT...", prog, files.size())
			
			for file in umtzip.get_files():
				extrac = FileAccess.open("user://Lib/UMT/" + file, FileAccess.WRITE)
				extrac.store_buffer(umtzip.read_file(file))
				extrac.close()
				prog += 1
				
				emit_signal("umt_download", "Extracting UMT...", prog, files.size())
				await get_tree().process_frame
			
			umtzip.close()
			DirAccess.remove_absolute("user://UMT.zip")
			
			emit_signal("umt_ready")
	pass

func _ready():
	await get_tree().process_frame
	if(DirAccess.dir_exists_absolute("user://Lib/UMT")):
		emit_signal("umt_ready")
	else:
		DirAccess.make_dir_recursive_absolute("user://Lib/UMT")
		downloadUmt()
