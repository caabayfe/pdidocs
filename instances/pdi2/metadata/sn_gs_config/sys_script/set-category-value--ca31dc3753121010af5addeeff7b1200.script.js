(function executeRule(current, previous /*null when async*/) {

	current.setValue('category_value', current.getValue('category').toLowerCase().replace(/\s/g,'_'));

})(current, previous);
