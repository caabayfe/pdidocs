var NormalChangeProcessSNC = Class.create();

NormalChangeProcessSNC.prototype = Object.extendsObject(ChangeProcess, {

	initialize: function(changeGr) {
		ChangeProcess.prototype.initialize.call(this, changeGr);
	},

	type: "NormalChangeProcessSNC"
});

NormalChangeProcessSNC.findAll = function(orderBy, textSearch, encodedQuery) {
	orderBy = orderBy || ChangeProcessSNC.NUMBER;
	var changeRequestGr = new GlideRecordSecure(ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addActiveQuery();
	changeRequestGr.addQuery("type", ChangeRequest.NORMAL);

	if (textSearch && textSearch.trim() !== "")
		changeRequestGr.addQuery(ChangeCommon.matchAll(), textSearch);

	if (encodedQuery && encodedQuery.trim() !== "")
		changeRequestGr.addEncodedQuery(encodedQuery);

	changeRequestGr.orderBy(orderBy);
	changeRequestGr.query();
	return changeRequestGr;
};

NormalChangeProcessSNC.findById = function(sysId) {
	if (!sysId)
		return null;

	var changeRequestGr = new GlideRecordSecure(ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("type", ChangeRequest.NORMAL);
	changeRequestGr.addQuery("sys_id", sysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return null;

	return new NormalChangeProcess(changeRequestGr);
};

NormalChangeProcessSNC.newChange = function(nameValuePairs) {
	var changeProcess = NormalChangeProcess.newChangeProcess(nameValuePairs);

	if (!changeProcess || !changeProcess.insert())
		return null;

	return changeProcess;
};

NormalChangeProcessSNC.newChangeProcess = function(nameValuePairs) {
	var changeProcess = new NormalChangeProcess(ChangeRequest.newNormal().getGlideRecord());

	var chgModel;
	if (nameValuePairs.chg_model) {
		chgModel = nameValuePairs.chg_model;
		delete nameValuePairs.chg_model;
	}

	var fields = changeProcess.setValues(nameValuePairs);
	if (fields.ignored && fields.ignored.length > 0)
		changeProcess.__ignoredfields = fields.ignored;

	if (chgModel) {
		if (!changeProcess.__ignoredfields)
			changeProcess.__ignoredfields = [];
		changeProcess.__ignoredfields.push("chg_model");
	}

	return changeProcess;
};
