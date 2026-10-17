setDisplayValues();

function setDisplayValues() {
	if (pm.isZboot()) {
		gs.log('Upgrade: Zbooting, no need to set display values for business_calendar_span_name');
		return;
	}       

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'business_calendar_span_name');
	//short_name is the element(label - Column name)
	gr.addQuery('element', 'short_name');
	gr.query();
	if (gr.next()) {
		if (!gr.display) {
			gs.log('short_name is no longer display column already');
			return;
		}
		gr.display = false;
		gr.update();
		gs.info('updates short_name display as false');
	}

	var gr2 = new GlideRecord('sys_dictionary');
	gr2.addQuery('name', 'business_calendar_span_name');
	// long_name is the element
	gr2.addQuery('element', 'long_name');
	gr2.query();
	if (gr2.next()) {
		gr2.display = true;
		gr2.update();
		gs.info('updates long_name display as true');
	}

}
