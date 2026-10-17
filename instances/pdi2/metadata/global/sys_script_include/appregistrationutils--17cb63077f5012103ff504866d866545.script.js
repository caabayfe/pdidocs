var AppRegistrationUtils = Class.create();
AppRegistrationUtils.prototype = {
    initialize: function() {
    },
	getRedirectionGlideRecord: function(tableName, sysId) {
		return this._getAnalyticsAppGR(tableName, sysId);
	},

	_getAnalyticsBucketGR: function(tableName, sysId) {
		var gr = new GlideRecord('sys_analytics_bucket');
		gr.addQuery('bucket_table_name', tableName);
		gr.addQuery('bucket_document_id', sysId);
		gr.query();
		return gr;
	},
	_getAnalyticsAppGR: function(tableName, sysId) {
		var gr = new GlideRecord('sys_analytics_app');
		gr.addQuery('table_name', tableName);
		gr.addQuery('app_sys_id', sysId);
		gr.query();
		return gr;
	},

    type: 'AppRegistrationUtils'
};
