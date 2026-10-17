(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.vision_api_enabled = gs.getProperty('glide.sg.image_recognition.search.enable', false) == 'true';
})(current, previous);
