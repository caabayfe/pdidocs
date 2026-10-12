var wf = gs.getSession().getWorkflow();
gs.getSession().setWorkflow(false);
update();
gs.getSession().setWorkflow(wf);

function update() {
	var upgrade = isUpgrade();
	if (upgrade) {
		deactivateAllReadOnlySetupTopics();
	}
}

function isUpgrade() {
	var gr = new GlideRecord('sys_cs_general_settings');
	// check the OOB general settings
	gr.addQuery('sys_id', '586237553b1323009cbbcea234efc42f');
	gr.query();
	if (gr.next()) {
		var closingTopic = gr.getValue('closing_topic');
		// setup topic is the new read-only version
		// it is the first time install the plugin
		if (closingTopic === '57cde45053130010cf8cddeeff7b1291') {
			return false;
		}
	}
	return true;
}

function deactivateAllReadOnlySetupTopics() {
	var readOnlySetupTopics = ['284e2c5053130010cf8cddeeff7b12df',
						'30ade05053130010cf8cddeeff7b12f3',
						'57cde45053130010cf8cddeeff7b1291',
						'9bae209053130010cf8cddeeff7b12ba',
						'aa0e685053130010cf8cddeeff7b127d',
						'b18df45853130010cf8cddeeff7b12fd',
						'ce2ee85053130010cf8cddeeff7b12bf',
						'eefd285053130010cf8cddeeff7b12b9',
						'f5ed285053130010cf8cddeeff7b12e1'];

	readOnlySetupTopics.forEach(deactivateTopic);
}

function deactivateTopic(sysId) {
    gs.log("Deactivating topic in sys_cs_topic: "+sysId);
	var gr = new GlideRecord('sys_cs_topic');
	gr.addQuery('sys_id', sysId);
	gr.query();
	if (gr.next()) {
		gr.active = false;
		if (gr.update()) {
			gs.log("Successfully deactivated topic in sys_cs_topic: "+sysId);
		} else {
			gs.log("Failed to deactivate topic in sys_cs_topic: "+sysId);
		}
	}
}
