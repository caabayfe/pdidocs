function onLoad() {
	var globalPlaybookExperienceId = "98e09a560f2200102920c912d4767e1a";
	var isGlobalPlaybookExperience = g_form.getUniqueValue() === globalPlaybookExperienceId;
	
	// if the record is the global playbook experience then show the info message 
	if(isGlobalPlaybookExperience)
		g_form.addInfoMessage(getMessage("Global Playbook Experience Message"));
}
