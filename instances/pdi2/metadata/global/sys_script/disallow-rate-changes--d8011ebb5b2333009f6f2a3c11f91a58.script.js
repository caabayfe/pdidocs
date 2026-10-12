(function executeRule(current, previous /*null when async*/) {

	if (!current.rate.changes())
		return;

	var ga = new GlideAggregate('fx_currency2_instance');
	ga.addQuery('conversion_rate', current.sys_id);
	if (ga.getCount() > 0) {
		gs.addErrorMessage(gs.getMessage("There are existing FX currency instance records refering to this record"));
		current.setAbortAction(true);
	}

})(current, previous);
