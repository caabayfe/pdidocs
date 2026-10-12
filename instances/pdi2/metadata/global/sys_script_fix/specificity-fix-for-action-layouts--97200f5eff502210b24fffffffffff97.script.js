var gr = new GlideRecord("sys_ux_form_action_layout");
gr.addEncodedQuery('action_configISNOTEMPTY^active=true');
gr.query();

while(gr.next()) {
	var tableCalc = gr.table == 'global' ? 0 : GlideDBObjectManager.getTables(gr.table).size();
	var tablePoints = 10 * tableCalc;
	var actionConfigPoints = gr.action_config ? 10 : 0;
	var specificity = tablePoints + actionConfigPoints; 
	if (gr.specificity !== specificity) {
		gr.setValue("specificity", specificity);
		gr.update();
	}
}
