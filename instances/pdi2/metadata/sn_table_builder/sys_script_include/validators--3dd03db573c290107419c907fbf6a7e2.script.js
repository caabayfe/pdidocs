var Validators = Class.create();

Validators.isValidPerspective = function (perspective) {
	for (var i in TBConstants.TB_PERSPECTIVES) {
		if (TBConstants.TB_PERSPECTIVES[i] === perspective) return true;
	}
	return false;
};

Validators.isValidRecord = function (tbObj) {
	return tbObj.isValidRecord();
};

/**
 * @param {GlideRecord} of sys_db_object
 * @param {String} perspective
 */

Validators.validatePerspective = function (perspective) {
	var res = {
		isValid: true,
	};
	if (!Validators.isValidPerspective(perspective)) {
		res = {
			isValid: false,
			message: gs.getMessage('Invalid perspective'),
			detail: gs.getMessage(
				'Should be one of [ {0} ]',
				TBUtil.getPerspectives().join(',')
			),
		};
	}
	return res;
};

/**
 * @param {GlideRecord} of sys_db_object
 */

Validators.validateTbObjAccess = function (tbObj) {
	var res = {
		isValid: true,
	};
	return res;
};

/**
 * @param {GlideRecord} of sys_db_object
 */

Validators.validateTbObjRecord = function (tbObj) {
	var res = {
		isValid: true,
	};
	if (!Validators.isValidRecord(tbObj)) {
		res = {
			isValid: false,
			message: gs.getMessage('No record found'),
		};
	}
	return res;
};

Validators.isValidAttachment = function isValidAttachment(sysId) {
	var res = {
		isValid: true,
	};

	var gr = new GlideRecordSecure(TBConstants.SYS_ATTACHMENT);
	gr.addQuery('sys_id', sysId);
	gr.query();

	if (!gr.hasNext()) {
		res.isValid = false;
		res.message = gs.getMessage('No attachment found');
	}

	return res;
};

Validators.isValidTableRecord = function (table) {
	var res = {
		isValid: false,
	};

	var gr = new GlideRecord(TBConstants.SYS_CLASS_DB_OBJECT);
	gr.addQuery('name', table);
	gr.query();

	if (gr.next()) {
		res.isValid = true;
	}
	return res;
};

Validators.prototype = {
	initialize() {},

	type: 'Validators',
};
