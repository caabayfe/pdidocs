var CleanupListExport = Class.create();
CleanupListExport.prototype = {
    initialize: function() {
    },

    type: 'CleanupListExport',

		// react to logout and cleanup any sys_poll data that may be left over
	cleanup: function(event) {
		var gr = new GlideRecord('sys_poll');
		gr.addQuery('session_id', event.instance);
		/*
			If a user log out on an long running export, the poll will be deleted and the attachment
			will be orphaned as a result. We prevent non-complete polls from being deleted in order to
			prevent such attachments from getting lost. The sys_poll table cleaner will eventually
			clean up polls which are complete and more than 24 hours old. 
		*/
		gr.addQuery('state', 'complete');
		gr.query();

		while (gr.next()) {
			gr.deleteRecord();
		}
	},

};
