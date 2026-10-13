var maxConcatenation = gs.getProperty('glide.notify.sms.max_concatenation');
if (maxConcatenation && maxConcatenation != '10') {
	gs.setProperty("glide.notify.sms.max_characters",(maxConcatenation * 160).toString());
}
