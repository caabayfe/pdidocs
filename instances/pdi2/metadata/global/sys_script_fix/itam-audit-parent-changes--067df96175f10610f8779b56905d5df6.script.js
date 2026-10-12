(function updateParentCoumn() {
	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'alm_asset');
	dictGr.addQuery('element', 'parent');
	dictGr.addNotNullQuery('attributes');
	dictGr.query();
	if (dictGr.next()) {
		var prevValue = dictGr.getValue('attributes');
		var values = prevValue.split(',');
		var newValues = [];
		newValues = values.filter(function (prop) {
			return prop.indexOf('no_audit') === -1;
		});
		dictGr.setValue('attributes', newValues.toString());
		dictGr.update();
	}
}());
