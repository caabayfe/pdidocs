(function executeRule(current, previous /*null when async*/) {
	var globalPlaybookExperience = '98e09a560f2200102920c912d4767e1a';
	var globalScreenCollection = '51ddfb5ac3113010948404186e40dd09';
	var customScreenCollection = '671efb5ac3113010948404186e40dd5e';

	if (!current.activity_ui.toString().length)
		return;
	
	g_scratchpad.activity_ui = current.activity_ui;
	g_scratchpad.activity_ui_screen = current.activity_ui.screen;
	g_scratchpad.activity_ui_page = current.activity_ui.playbook_experience.toString() == globalPlaybookExperience ? globalScreenCollection : customScreenCollection;

})(current, previous);
