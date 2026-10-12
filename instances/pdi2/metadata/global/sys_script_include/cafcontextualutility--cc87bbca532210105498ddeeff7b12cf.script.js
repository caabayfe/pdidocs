var CAFContextualUtility = Class.create();
CAFContextualUtility.prototype = {
    initialize: function() {
    },
	
	// Logic for moving back to topic discovery or topic picker if needed after a keyword topic
	postProcess: function() {
		var topicPicker = vaVars.global_ca_keyword_topic_picker;
		var welcomeTopic = vaVars.global_ca_keyword_welcome_topic;
		var searchText = vaVars.global_ca_keyword_topic_discovery_search_text;
		var linkAccountTopic = vaVars.global_ca_keyword_link_account_adapter;
		var setupWelcomeTopic = vaVars._setup_welcome_topic;
		var deploymentId = vaVars.global_deployment_id;

		if (!gs.nil(deploymentId)) {
			this._nowAssistPostProcess(searchText, topicPicker, setupWelcomeTopic, linkAccountTopic);
			return;
		}

		if (searchText != undefined && searchText != '') {
			vaVars.global_ca_keyword_topic_discovery_search_text = '';
			vaSystem.topicDiscovery(searchText, null);
		} else if (topicPicker != undefined && topicPicker != '') {
			vaVars.global_ca_keyword_topic_picker = '';
			vaSystem.switchTopic(topicPicker);
		} else if (welcomeTopic != undefined && welcomeTopic != '') { //older conversations
			vaVars.global_ca_keyword_welcome_topic = '';
			vaSystem.switchTopic('_topic_picker_');
		} else if (linkAccountTopic != undefined && linkAccountTopic != '') {
			vaVars.global_ca_keyword_link_account_adapter = '';
			vaSystem.switchTopic(linkAccountTopic);
		} 
	},

	_nowAssistPostProcess: function(searchText, topicPicker, setupWelcomeTopic, linkAcountAdapterTopic) {
		if (!gs.nil(searchText)) {
			vaVars.global_ca_keyword_topic_discovery_search_text = '';
			vaSystem.executeSkillDiscovery(searchText);
		} else if (!gs.nil(setupWelcomeTopic) && !gs.nil(topicPicker)) {
			vaSystem.switchTopic(setupWelcomeTopic);
		} else if (!gs.nil(linkAcountAdapterTopic)) {
			vaVars.global_ca_keyword_link_account_adapter = '';
			vaSystem.switchTopic(linkAcountAdapterTopic);
		}
	},

    type: 'CAFContextualUtility'
};
