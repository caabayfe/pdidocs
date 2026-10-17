(function executeRule(current, previous /*null when async*/) {
	// When callback url is modified - we need to make sure to perform callback url validation next time. 
	// So, setting it to false
	gs.setProperty('glide.ml.callback_url.validation.status','false');
})(current, previous);
