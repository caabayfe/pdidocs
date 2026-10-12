var fontSize = current.value;
if (fontSize == '' || isNaN(fontSize) || fontSize < 1) {
	gs.addInfoMessage(gs.getMessage("Invalid font size. Value replaced with 14"));
	current.value = "14"; // use current default
} else if (fontSize > 36) {
	gs.addInfoMessage(gs.getMessage("Large font sizes may not render well"));
}
