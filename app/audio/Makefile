strip_spaces:
	rename --nows *
	rename --nows */*.mp3

index:
	ruby mp3s_to_json.rb | jsonpp > index.json

cdn:
	rsync -avh --progress . dx:/apps/cdn/listen --exclude=Makefile --exclude=index.json --exclude=mp3s_to_json.rb
