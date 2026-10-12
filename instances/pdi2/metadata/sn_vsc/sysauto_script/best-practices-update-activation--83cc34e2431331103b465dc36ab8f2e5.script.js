var gr = new GlideRecord('sn_vsc_best_practice_configurations');
gr.addEncodedQuery('active=false'); // Query for inactive best practices
gr.query();
while (gr.next()) {
    if (gr.pre_condition) {
        gr.active = new GlideScopedEvaluator().evaluateScript(gr, "pre_condition");
	} else {
        gr.active = true;
	}
    gr.update();
}

var grBP = new GlideRecord('sn_vsc_best_practice_configurations');
grBP.addQuery('status', 'open');
grBP.addQuery('active', true);
grBP.query();
while (grBP.next()) {
    var grPC = new GlideRecord('sys_pd_context');
    grPC.addQuery('input_record', grBP.sys_id);
    grPC.orderByDesc('sys_updated_on');
    grPC.query();
    if (!grPC.next()) {
        gs.warn("Failed to find the sys_pd_context for sn_critical_update " + grBP.sys_id);
        continue;
    }
    if (grPC.getValue('state') == "COMPLETE") {
        grBP.setValue('status', 'completed');
        grBP.update();
    }
}
