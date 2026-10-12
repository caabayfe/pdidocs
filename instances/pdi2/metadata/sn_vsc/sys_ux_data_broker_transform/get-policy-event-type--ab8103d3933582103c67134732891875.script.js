function transform(input) {
    var events = [];
    var gr = new GlideRecord("sn_vsc_security_policy_event_type");
    gr.query();
    while (gr.next()) {
	events.push({
		"id": gr.getValue('sys_id').toString(),
		"name": gr.getDisplayValue("name"),
		"description": gr.getDisplayValue("description")
	});
    }
    return events;
}
