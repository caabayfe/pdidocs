migrateInteractionChannelToType();

function migrateInteractionChannelToType() {
	var connGR = new GlideRecord('interaction_connector');

	if (!connGR.isValid()) {
		gs.log('Interaction connector table does not exist.');
		return;
	}

	connGR.addQuery("sys_id", "IN",
		"28a59893873103002ae97e2526cb0b5d,45c367463b801300758ce9b534efc4ea,e3c2a22eb3b203002186a72256a8dc71");
	connGR.query();
	while (connGR.next()) {
		var choiceGR = new GlideRecord('sys_choice');
		choiceGR.addQuery("name", "interaction");
		choiceGR.addQuery("element", "type");
		choiceGR.addQuery("value", connGR.getValue("name"));
		choiceGR.query();
		if (choiceGR.next()) {
			var interactionGR = new GlideRecord('interaction');
			if (!interactionGR.isValidField('channel')) {
				gs.log('Interaction "channel" column does not exist.');
				return;
			}
			interactionGR.addQuery("channel", connGR.getValue("sys_id"));
			interactionGR.addNullQuery("type");
			interactionGR.query();
			interactionGR.setValue('type', choiceGR.getValue("value"));
			interactionGR.setWorkflow(false);
			interactionGR.setUseEngines(false);
			interactionGR.updateMultiple();
			gs.log('Updated ' + interactionGR.getRowCount() + ' ' + connGR.getValue("name") + ' interaction record(s) to use the "type" field.');
		}
	}
}
