(function executeRule(current, previous /*null when async*/) {

	var catalogGr = new GlideRecordSecure('sc_catalog');
	catalogGr.addActiveQuery();
	catalogGr.addQuery('enable_wish_list', true);
	catalogGr.query();
	catalogGr.setValue('enable_wish_list', false);
	catalogGr.updateMultiple();

})(current, previous);
