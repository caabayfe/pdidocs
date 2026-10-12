function transform(input) {
	var result = [];
	var gr = new GlideRecord('sn_mif_instance');
	gr.addQuery('is_prod', true);
	gr.query();
	while(gr.next()){
		var instanceName = gr.getValue('instance_name');
		result.push(instanceName);
	}
	return result;
}
