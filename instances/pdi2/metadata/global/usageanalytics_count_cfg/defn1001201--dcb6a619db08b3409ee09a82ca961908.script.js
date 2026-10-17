answer = JSON.stringify(getInstanceConfigForADME());

function getInstanceConfigForADME() {
	var result = {};

	if (!GlideTableDescriptor.isValid('sys_properties'))
		return result;

	var count = 0;
	var value = '';

	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'glide.discovery.enable_adme');
	gr.query();
	if (gr.next()) {
		value = gr.value + '';
		count++;
	}
	result['instance_config'] = [{'glide.discovery.enable_adme':value}];
	result['count'] = count;

	return result;
}
