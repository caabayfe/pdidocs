if (!pm.isZboot()) {
	// set the display to 'true' for sla definition field
	var dictionaryGR = new GlideRecord('sys_dictionary');
	dictionaryGR.addQuery('name', 'task_sla');
	dictionaryGR.addQuery('display', 'true');

	dictionaryGR.query();
	if (dictionaryGR.getRowCount() == 0){
		dictionaryGR = new GlideRecord('sys_dictionary');
		dictionaryGR.addQuery('name', 'task_sla');
		dictionaryGR.addQuery('element', 'sla');
		dictionaryGR.query();
		if (dictionaryGR.next()){
			dictionaryGR.setValue('display','true');
			dictionaryGR.update();
		}
	}
	else
		gs.log('Not setting display value as there is a field already set as a display field');
}
