var CleanupListExportLimitTime = Class.create();
CleanupListExportLimitTime.prototype = {
    type: 'CleanupListExportLimitTime',

    initialize: function() {
    },

	cleanup: function() {
		var oldest = new GlideDateTime();
		oldest.subtract(1000*3600*24); // 24 hours
		oldest = '' + oldest;

		var gr = new GlideRecord('sys_poll');
		gr.addQuery('sys_created_on', '<', oldest);
		gr.query();

		while (gr.next()) {
			gr.deleteRecord();
		}
	},

};
