function onLoad() {
    // hide submit buttons
	var submitBtns = $$('.form_action_button[value="sysverb_insert"][id="sysverb_insert"]');
	for (var i=0; i<submitBtns.length; i++)
		submitBtns[i].hide();
	// hide update button at bottom since flow has a bug which failed to update the onclick function
	$$('.form_action_button_container')[0].hide();
	// hide trigger level embedded list in new form
	var sysId = g_form.getUniqueValue();
	var trigger = new GlideRecord('sys_metric_trigger_definition');
	if (!trigger.get(sysId))
		$$('.embedded[tab_caption^="MetricBase"][tab_caption$="Trigger Levels"]')[0].hide();
}
