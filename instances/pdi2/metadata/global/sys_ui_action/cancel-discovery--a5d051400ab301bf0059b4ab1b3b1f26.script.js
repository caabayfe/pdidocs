cancelDiscovery();

function cancelDiscovery() {
	var script = "var dac =  new SncDiscoveryCancel();"
		+ "dac.cancelAll('" + current.sys_id + "');";

	var trigger = new GlideRecord('sys_trigger');
	trigger.initialize();
	trigger.name = "Cancel_Discovery_" + current.number;
	trigger.script = script;
	trigger.trigger_type = 0; //Run Once
	trigger.next_action.setDateNumericValue(0); //Run immediately
	trigger.insert();
}
