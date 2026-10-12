var LoadPlaybookExperienceStatusValues = Class.create();
LoadPlaybookExperienceStatusValues.prototype = {
    initialize: function() {
    },
	
	load: function(current) {
		var grMapping = new GlideRecord('sys_playbook_experience_status_mapping');
	
		grMapping.get(current.getValue('experience_status_mapping_record'));

		if (!grMapping.isValid()) 
			return;

		var statusTable = grMapping.getValue('experience_status_table');
		var statusField = grMapping.getValue('experience_status_field');

		if (!statusTable || !statusField) 
			return;

		var choiceList = GlideChoiceListGenerator.getChoiceList(statusTable, statusField).iterator();
		var statusChoices = [], choice;
		while(choiceList.hasNext()){
			choice = choiceList.next();
			statusChoices.push({label: choice.getLabel(), value: choice.getValue()});
		}
		g_scratchpad.statusChoices = statusChoices;
	},
	
    type: 'LoadPlaybookExperienceStatusValues'
};
