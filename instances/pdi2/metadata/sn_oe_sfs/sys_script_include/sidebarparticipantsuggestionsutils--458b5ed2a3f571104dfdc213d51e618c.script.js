var SidebarParticipantSuggestionsUtils = Class.create();
SidebarParticipantSuggestionsUtils.prototype = {
    initialize: function() {
    },
	getParticipantSuggestions: function(documentTable, documentId, path, count) {

		try {
			var eps = new GlideScriptedExtensionPoint().getExtensions('sn_oe_sfs.ParticipantSuggestionsExtPoint');
			for (var i = 0; i < eps.length; i++) {
				if (eps[i].isValid(documentTable, documentId, path)) {
					var participants = eps[i].getParticipantSuggestions(documentTable, documentId, path);
					if (participants && participants.length > 0)
						var index = participants.indexOf(gs.getUserID());
						// If the current user is in the participant list, remove the current user.
						if (index > -1) {
							participants.splice(index, 1);
							if (participants.length > 0)
								return participants;
						}
						else
							return participants;
				}
			}
		} catch (ex) {
			gs.error('Error running sn_oe_sfs.ParticipantSuggestionsExtPoint extension points.');
		}

		if (!GlidePluginManager.isActive("com.glide.sn_participant_suggestions"))
			return [];

		var experts = sn_participant_sug.ParticipantSuggestionsMLHelper.getSimilarRecords(documentId, documentTable, count);
		return experts.map(x => {return {"sysId": x};});
	},
	showParticipantSuggestions: function(documentTable, documentId, userId) {
		try {
			var eps = new GlideScriptedExtensionPoint().getExtensions('sn_oe_sfs.SidebarParticipantSuggestionsExtPoint');
			for (var i = 0; i < eps.length; i++) {
				if (!eps[i].showParticipantSuggestions(documentTable, documentId, userId)) {
					return false;
				}
			}
		} catch (ex) {
			gs.error('Error running sn_oe_sfs.SidebarParticipantSuggestionsExtPoint extension points.');
		}
		return true;
	},
	participantSuggestionsEnabled: function() {
		var gr = new GlideRecord('sys_cs_collab_settings');
		gr.query();

		if (gr.next())
			return gr.getValue('enable_expert_finder') == 1;

		return false;
	},
	participantSuggestionsConfigured: function() {
		var oneExtendDefinitionConfigGR = new GlideRecord("sys_one_extend_definition_config");
		oneExtendDefinitionConfigGR.addQuery("capability","853f0b7243d4f1106ccb3fc9dbb8f251");
		oneExtendDefinitionConfigGR.addActiveQuery();
		oneExtendDefinitionConfigGR.query();
		return oneExtendDefinitionConfigGR.getRowCount() > 0;
	},
	saveConfig: function(allGroupsFlag, groups) {
		var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';
		var success;

		var index = 0;
		var selectedGroupIds = [];
		while (groups[index]) {
			selectedGroupIds.push(groups[index][0].id);
			index++;
		}

		var gr = new GlideRecord('sys_cs_collab_participant_suggestions_config');
		gr.addActiveQuery();
		gr.addQuery('sys_domain', currentDomain);
		gr.query();
		if (!gr.next()) {
			gr.name = "Participant Suggestion Config";
			gr.active = true;
			gr.apply_to_all_groups = allGroupsFlag;
			gr.apply_to_groups = selectedGroupIds.join(',');
			gr.sys_domain = currentDomain;
			success = gr.insert();
		} else {
			gr.apply_to_all_groups = allGroupsFlag;
			gr.apply_to_groups = selectedGroupIds.join(',');
			success = gr.update();
		}

		var response = {};
		if (success) {
			response.status = 200;
			response.body = {
				message: gs.getMessage('Success! Configuration saved'),
				error: false
			};
		} else {
			response.status = 500;
			response.body = {
				message: gs.getMessage('Failed! Configuration not saved'),
				error: true
			};
		}
		return response;
	},
	getUserGroups: function(filter) {
		var availableResult = {};
        var groups = {};

		var gr = new GlideRecord('sys_user_group');
		gr.addEncodedQuery(filter);
		gr.query();

		while(gr.next()) {
			var groupId = gr.getUniqueValue();
            var item = {};
            var definitionName = gr.getDisplayValue('name');
            item.label = definitionName;
            groups[groupId] = item;
		}

		availableResult.group = groups;
		var result = {
            availableResult: availableResult
        };

		var response = {};
        response.status = 200;
        response.body = {
            message: gs.getMessage('Filters applied successfully'),
            items: result
		};

        return response;
	},
	displayUserGroups: function (){
		try{
			var gr = new GlideRecord('sys_cs_collab_participant_suggestions_config');
			gr.query();
			while(gr.next()) {
				if(gr.getValue('apply_to_all_groups') == true){
					var allGroups = this.getAllGroups();
					return this.checkUserIsMember(allGroups);
				} else {
					var groups = gr.getValue('apply_to_groups').split(',');
					return this.checkUserIsMember(groups);
				}
			}
		} catch (ex) {
			gs.error('Error retrieving participant suggestion config record.');
		}
	},
	getAllGroups: function(){
		var groups = [];
		var gr = new GlideRecord('sys_user_group');
		gr.addActiveQuery();
		gr.query();
		while(gr.next()){
			groups.push(gr.getUniqueValue());
		}
		return groups;
	},
	checkUserIsMember: function(groups) {
		// Check if the groups the user belongs to is part of the given groups
		var userGroups = gs.getUser().getMyGroups();
		return userGroups.some(grp => groups.includes(grp));
	},
    type: 'SidebarParticipantSuggestionsUtils'
};
