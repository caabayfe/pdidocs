function onLoad() {
	var classificationId = g_form.getValue('classy');
	var classification = new GlideRecord('discovery_classy');
	if (!classification.get(classificationId))
		return;
   
	switch(classification.sys_class_name) {
		case 'discovery_classy_cim':
			g_form.setDisplay('operator', false);
			g_form.setDisplay('value', false);
			break;
		  
		default:
			g_form.setDisplay('criterion', false);
	}
   
	g_form.setReadOnly('classy', true);
}
