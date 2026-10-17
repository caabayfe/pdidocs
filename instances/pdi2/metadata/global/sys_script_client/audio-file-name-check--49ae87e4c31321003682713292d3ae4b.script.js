function onLoad() {
	g_form.hideFieldMsg('db_audio.name');
	if(!isAudioExtValid()) 
		g_form.showFieldMsg('db_audio.name','Invalid file extension. Must be in format yourfile.mp3 or yourfile.ogg','error');
}

function onChange() {
	g_form.hideFieldMsg('db_audio.name');
	if(!isAudioExtValid()) 
		g_form.showFieldMsg('db_audio.name','Invalid file extension. Must be in format yourfile.mp3 or yourfile.ogg','error');
}

function isAudioExtValid() {
	var supported_exts = ["mp3", "ogg"];
	var name = g_form.getValue('db_audio.name');
	var nameAry = name.split(".");
	var ext = nameAry[(nameAry.length - 1)];
	var is_supported = false; 
	for(i=0; i<supported_exts.length; i++) {
		if(supported_exts[i].valueOf() === ext.valueOf()) {
			is_supported = true;
			break;
		}
	}
	
	return is_supported
}
