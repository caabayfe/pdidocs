var gr = new GlideRecord('sys_properties');
gr.addQuery('name', 'glide.ui.concourse.onmessage_enforce_same_origin_whitelist');
gr.addNotNullQuery('value');
gr.query();
while (gr.next()){
	var propVal = gr.getValue('value');
	var cleanPropVal = propVal.trim().replace(/\r?\n/g, ",");
	gr.setValue('value', cleanPropVal);
	gr.setValue('description', 'List of trusted origins we allow to propagate messages (sent via window.postMessage) in the UI. Origins must be separated by a comma, line breaks can negatively affect page rendering.');
	gr.update();
}
