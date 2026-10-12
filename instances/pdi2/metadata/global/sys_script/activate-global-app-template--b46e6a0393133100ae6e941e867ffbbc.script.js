function onAfter(current, previous) {
    var gr = new GlideRecord('sn_appcreator_app_template');
	if(gr.get('2d79434393133100ae6e941e867ffb40')) {
		if(current.value.toString() == 'true' && current.operation() != 'delete')
			gr.active = true;
		else
			gr.active = false;
		
		gr.update();
	}   
}
