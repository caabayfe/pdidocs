(function executeRule(current, previous /*null when async*/) {
   var rec = new GlideRecord('sn_ci_analytics_formula_override');
	rec.addActiveQuery();
    rec.addQuery('type', current.type);
    rec.addQuery('key', current.key);
	rec.query();
	if(rec.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("We found an existing formula with the same type and key."));
	}
	
})(current, previous);
