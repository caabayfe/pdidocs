(function showWalkupRecordInformationTab(params) {
	var table = gs.nil(params.table) ? '' : params.table;
	if (table == '' || table !== 'interaction') {
		return false;
	}
	var sysId = gs.nil(params.sysId) ? '' : params.sysId;
	if (sysId === '' || sysId === '-1') {
		return true;
	}
	var intGr = new GlideRecord(table);
	if (intGr.get(sysId) && intGr.canRead()) {
		var type = intGr.getValue('type');
		return type !== "walkup";
	}
	return false;
})(inputProperties);
