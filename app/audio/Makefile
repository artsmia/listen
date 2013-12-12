strip_spaces:
	rename --nows *
	rename --nows */*.mp3

index:
	ruby mp3s_to_json.rb | jsonpp > index.json
