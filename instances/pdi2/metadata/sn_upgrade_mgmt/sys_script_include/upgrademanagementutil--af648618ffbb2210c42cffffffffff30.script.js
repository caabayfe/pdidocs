var UpgradeManagementUtil = Class.create();
UpgradeManagementUtil.prototype = {
    initialize: function() {
    },
	// Function to restart playbook activity (cascaded) - since default "Restart activity" event on UIB doesn't work
	restartActivity: function(sys_pd_context_sys_id, sys_pd_activity_context_sys_id) {
		try{
			var gr = new GlideRecord('sys_pd_context');
			var found = gr.get(sys_pd_context_sys_id); // this is the sys_id of a sys_pd_context record
			if (found) {
				var result = sn_playbook.PlaybookExperience.restartPlaybook(gr, '', sys_pd_activity_context_sys_id); // this is the sys_id of a sys_pd_activity_context record, and the lane context id is blank.
				// gs.info(JSON.stringify(result));
			}else
				throw 'invalid pd context';
		}catch(e){
			gs.error(e);
		}
	},

    type: 'UpgradeManagementUtil'
};
