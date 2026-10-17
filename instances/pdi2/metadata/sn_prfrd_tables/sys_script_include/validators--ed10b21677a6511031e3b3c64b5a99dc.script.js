var Validators = Class.create();

Validators.isValidContext = function (context) {
	var res = {
		isValid: false,
	};

	var gr = new GlideRecord('sn_preferred_table_context');
	gr.addQuery('name', context);
	gr.query();

	if (gr.next()) {
		res.isValid = true;
	} else {
		if(context) {
			res.message = gs.getMessage('{0} context is invalid.', context);
		} else {
			res.message = gs.getMessage('context is required in the query parameter.');
		}
	}
	return res;
};

Validators.isAppScopeExists = function (options) {
	var res = {
		isValid: true,
	};

	if (!options.app_scope) {
		res.isValid = false;
		res.message = gs.getMessage(
			'app scope is required in the query parameter.'
		);
	}
	return res;
};

Validators.prototype = {
	initialize: function () {},

	type: 'Validators',
};
