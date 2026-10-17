function getValuePattern() {
	var gw = new GlideModal('customMatcherGenerateRegex', false, 800);
	gw.setTitle(getMessage('Please choose the option that closely matches the values you expect to see in the columns'));
	gw.render();
}
