var CMDBTeamsUtil = Class.create();
CMDBTeamsUtil.prototype = {
	
    TEAMS_TABLE: 'cmdb_rel_team',
	GRP_TYPE_FIELD: 'group_type',
	
	APPROVAL_GRP_TYPE: 'approval',
	ASSIGNMENT_GRP_TYPE: 'change',
	MANAGED_BY_GRP_TYPE: 'managed_by',
	SUPPORT_GRP_TYPE: 'support',
	
	APPROVAL_GRP: 'change_control',
	ASSIGNMENT_GRP: 'assignment_group',
	MANAGED_BY_GRP: 'managed_by_group',
	SUPPORT_GRP: 'support_group',
	
    initialize: function() {
    },
	
	syncTeamsWithGroups: function(current, isTeamsUpdate) {
		if(isTeamsUpdate) {
			this.syncToLegacy(current);
		} else {
			this.syncToTeams(current);
		}
	},
	
	syncToLegacy: function(current){
		var groupType = current.getValue(this.GRP_TYPE_FIELD);
		var teamGroupValue = current.getValue('user_group');
		var ciGr = new GlideRecord('cmdb_ci_service');
		if(ciGr.get(current.getValue('ci'))){
			switch(groupType){
				case this.APPROVAL_GRP_TYPE:
					this.updateIfChanged(ciGr, this.APPROVAL_GRP, teamGroupValue);
					break;
				case this.ASSIGNMENT_GRP_TYPE:
					this.updateIfChanged(ciGr, this.ASSIGNMENT_GRP, teamGroupValue);
					break;
				case this.MANAGED_BY_GRP_TYPE:
					this.updateIfChanged(ciGr, this.MANAGED_BY_GRP, teamGroupValue);
					break;
				case this.SUPPORT_GRP_TYPE:
					this.updateIfChanged(ciGr, this.SUPPORT_GRP, teamGroupValue);
					break;
				default: //Only update for fields that exist on CI form
			}
		}
	},

	updateIfChanged: function(ci, groupField, teamsValue){
		var ciGroupValue = ci.getValue(groupField);
		if(!ciGroupValue.equals(teamsValue)){
			ci.setValue(groupField, teamsValue);
			ci.update();
		}
	},
	
	/*
	* Currently these fields are hard coded, if in the future more group types
	* are added to cmdb_ci or a child class, they won't be caught for sync
	* until this script is updated
	*/
	syncToTeams: function(current){
		//First query for all existing relation records in one call, 
		//check if current has changed the value of that related user group and update
		var gr = new GlideRecord(this.TEAMS_TABLE);
		gr.addQuery('ci', current.getUniqueValue());
		gr.query();
		
		var seenItems = [];
		
		while(gr.next()){
			var groupType = gr.getValue(this.GRP_TYPE_FIELD);
			seenItems.push(groupType);
			switch(groupType){
				case this.APPROVAL_GRP_TYPE:
					if(current.getElement(this.APPROVAL_GRP).changes()){
						if(gs.nil(current.getValue(this.APPROVAL_GRP)))
							gr.deleteRecord();
						else{
							gr.setValue('user_group', current.getValue(this.APPROVAL_GRP));
							gr.update();
						}
					}
					break;
				case this.ASSIGNMENT_GRP_TYPE:
					if(current.getElement(this.ASSIGNMENT_GRP).changes()){
						if(gs.nil(current.getValue(this.ASSIGNMENT_GRP)))
							gr.deleteRecord();
						else{
							gr.setValue('user_group', current.getValue(this.ASSIGNMENT_GRP));
							gr.update();
						}
					}
					break;
				case this.MANAGED_BY_GRP_TYPE:
					if(current.getElement(this.MANAGED_BY_GRP).changes()){
						if(gs.nil(current.getValue(this.MANAGED_BY_GRP)))
							gr.deleteRecord();
						else{
							gr.setValue('user_group', current.getValue(this.MANAGED_BY_GRP));
							gr.update();
						}
					}
					break;
				case this.SUPPORT_GRP_TYPE:
					if(current.getElement(this.SUPPORT_GRP).changes()){
						if(gs.nil(current.getValue(this.SUPPORT_GRP)))
							gr.deleteRecord();
						else{
							gr.setValue('user_group', current.getValue(this.SUPPORT_GRP));
							gr.update();
						}
					}
					break;
				default:
					break;
			}
			
		}
		
		//now create new records for all changes to current that didn't have associated relationship 
		if(seenItems.length < 4){
			
			if(current.getElement(this.APPROVAL_GRP).changes() && seenItems.indexOf(this.APPROVAL_GRP_TYPE) == -1)
				this.createNewRel(this.APPROVAL_GRP, this.APPROVAL_GRP_TYPE, current);

			if(current.getElement(this.ASSIGNMENT_GRP).changes() && seenItems.indexOf(this.ASSIGNMENT_GRP_TYPE) == -1)
				this.createNewRel(this.ASSIGNMENT_GRP, this.ASSIGNMENT_GRP_TYPE, current);

			if(current.getElement(this.MANAGED_BY_GRP).changes() && seenItems.indexOf(this.MANAGED_BY_GRP_TYPE) == -1)
				this.createNewRel(this.MANAGED_BY_GRP, this.MANAGED_BY_GRP_TYPE, current);

			if(current.getElement(this.SUPPORT_GRP).changes() && seenItems.indexOf(this.SUPPORT_GRP_TYPE) == -1)
				this.createNewRel(this.SUPPORT_GRP, this.SUPPORT_GRP_TYPE, current);
		}
	},
	
	createNewRel: function(groupName, groupType, current){
		var newGr = new GlideRecord('cmdb_rel_team');
		newGr.setValue('ci', current.getUniqueValue());
		newGr.setValue('user_group', current.getValue(groupName));
		newGr.setValue('group_type', groupType);
		newGr.insert();
	},
	
	/*Search the cmdb for all items with group associations and create relationships
	* in the cmdb_rel_team table, one group type at a time
	*/
	bulkPopulate: function(){
		this._searchAndUpdateGroupType(this.APPROVAL_GRP, this.APPROVAL_GRP_TYPE);
		this._searchAndUpdateGroupType(this.ASSIGNMENT_GRP, this.ASSIGNMENT_GRP_TYPE);
		this._searchAndUpdateGroupType(this.MANAGED_BY_GRP, this.MANAGED_BY_GRP_TYPE);
		this._searchAndUpdateGroupType(this.SUPPORT_GRP, this.SUPPORT_GRP_TYPE);
	},
	
	_searchAndUpdateGroupType: function(groupCol, groupType){
		var gr = new GlideRecord('cmdb_ci_service');
		gr.addNotNullQuery(groupCol);
		gr.query();
		
		while(gr.next()){
			this.createNewRel(groupCol, groupType, gr);
		}
	},

    type: 'CMDBTeamsUtil'
};
