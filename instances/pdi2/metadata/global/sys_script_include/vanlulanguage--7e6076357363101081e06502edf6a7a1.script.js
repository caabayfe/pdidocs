var VaNluLanguage = Class.create();
VaNluLanguage.prototype = {

	getLanguageQuery:function() {
		var gr = new GlideRecord('open_nlu_driver_language');
		gr.addEncodedQuery('driver.active=true');
		gr.query();
		var result = [];
		while (gr.next()) {
			result.push(gr.getUniqueValue());
		}

		return 'sys_idIN' + result.join(',');
	},

	type: 'VaNluLanguage'
};
