var VizACLUtil = Class.create();
VizACLUtil.prototype = {
    initialize: function() {
    },
	
	_canViewViz: function(vizId) {
		var grs = new GlideRecordSecure('par_visualization');
		return grs.get(vizId);
	},
	
	_getUserRoleSysIds: function(roles) {
		var roleSysIds = [];
		var gr = new GlideRecord('sys_user_role');
		gr.addQuery('name', 'IN', roles);
		gr.query();
		
		while (gr.next())
			roleSysIds.push(gr.getUniqueValue());
		
		return roleSysIds;
	},
	
	_getSharingQCOnUserRoleGroup: function() {
		var gr = new GlideRecord('par_visualization_permission');
		
		var qc = gr.addQuery('user', gs.getUserID());
		qc.addOrCondition('group', 'IN', gs.getUser().getMyGroups());
		qc.addOrCondition('role', 'IN', this._getUserRoleSysIds(gs.getUser().getRoles()));
		
		return qc;
	},

	ownViz: function(vizId) {
		var gr = new GlideRecord('par_visualization_permission');
		
		gr.addQuery('component', vizId);
		gr.addQuery('owner', true);
		var qc = gr.addQuery('user', gs.getUserID());
		qc.addOrCondition('group', 'IN', gs.getUser().getMyGroups());
		
		gr.query();
		return gr.hasNext();
	},
	
	canShareViz: function(vizId) {
		if (!this._canViewViz(vizId))
			return false;
		
		if (this.ownViz(vizId))
			return true;
		
		var gr = new GlideRecord('par_visualization_permission');
		gr.addQuery('component', vizId);
		var qc = gr.addQuery('can_share', true);
		qc.addCondition(this._getSharingQCOnUserRoleGroup());
		
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
	
	isVizSharedWithMeOrIamOwner: function(vizId) {		
		var gr = new GlideRecord('par_visualization_permission');
		
		var qc = gr.addQuery('component', vizId);
		qc.addCondition(this._getSharingQCOnUserRoleGroup());

		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
	
	isVizSharedWithMeWithEditModeOrIamOwner: function(vizId) {		
		var gr = new GlideRecord('par_visualization_permission');
		
		gr.addQuery('component', vizId);
		var qc = gr.addQuery('write', true);
		qc.addCondition(this._getSharingQCOnUserRoleGroup());

		gr.setLimit(1);
		gr.query();
		if (gr.hasNext()) {
			return true;
		} else if (gs.getUser().hasRole('report_group') && this.isVizSharedWithMeOrIamOwner(vizId)) {
			// This logic is for migrated visualizations only, check if viz is a migrated viz
			var grBridge = new GlideRecord('par_coreui_migration_bridge_component');
			grBridge.addQuery('component',vizId);
			grBridge.setLimit(1);
			grBridge.query();
			return grBridge.hasNext();
		}
		return false;
	},

    type: 'VizACLUtil'
};
