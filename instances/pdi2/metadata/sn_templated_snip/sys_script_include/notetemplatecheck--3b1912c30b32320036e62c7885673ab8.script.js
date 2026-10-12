var NoteTemplateCheck = Class.create();
NoteTemplateCheck.prototype = {
    initialize: function() {},

    /*
	 * Determine if a record matches the condition for any template response
     * @input  currentTable: String , sys_id: String
     * @output  Boolean
     * 
     */
	hasAvailableTemplate: function(currentTable, sysId) {
		if (!currentTable || !sysId)
			return false;
		
		// Query template configurations for @currentTable or its parent tables
		var grTemplateConfigs = new GlideRecordSecure("sn_templated_snip_note_template");
		grTemplateConfigs.orderBy('condition'); // Empty conditions return true if the grRecord is found, so order them first
		grTemplateConfigs.addQuery("table", "IN", new GlideTableHierarchy(currentTable).getTables());
		grTemplateConfigs.addJoinQuery("m2m_response_template_to_channel", "sys_id", "response_template")
			.addCondition("channel.value", new sn_templated_snip.ResponseTemplate().CHANNEL_FORM);
		grTemplateConfigs.query();
		
		// Prevent triggering an RCA for tables that have not implemented any Templated Snippets
		if (!grTemplateConfigs.hasNext())
			return false;
		
		var grRecord = new GlideRecord(currentTable);
		if (!grRecord.isValid() || !grRecord.get(sysId))
			return false;
		
		while (grTemplateConfigs.next()) {
			var condition = grTemplateConfigs.getValue('condition');
			
			//Return true if the template has an empty condition, or the grRecord matches the condition
			if (!condition)
				return true;
			
			var filterRecord = new GlideFilter(condition, 'conditon');
			filterRecord.setEnforceSecurity(true);
			if (filterRecord.match(grRecord, true))
				return true;
		}
		
		return false;
    },

    /*
     * isUserGroupVisible() method validates if user is in Response Visibility Group; 
     * used by ACLs
     * @input  current record in Template Configuration Table: 
     * @output  Boolean
     */
    isUserGroupVisible: function(templateConfigurationGr) {
        var visibilityList = templateConfigurationGr.getValue('group_visibility');

        // If visibility list empty, all groups are allowed
        if (!visibilityList)
            return true;

        // Check for User's membership in allowed groups
        var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('user', gs.getUserID());
        gr.addQuery('group', 'IN', visibilityList);
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    // Generate category list
    getCategories: function(tableName, sysId) {
        var maxCategories = gs.getProperty("sn_templated_snip.max_template_responses", 500);
		
		var responseTemplate = new sn_templated_snip.ResponseTemplate();
		var opts = {
			channel: responseTemplate.CHANNEL_FORM
		};

		var results = responseTemplate.query(tableName, sysId, '', maxCategories, 0, true, '', opts);
		
		var parsedResults;
		
		try {
			parsedResults = JSON.parse(results);
		} catch (e) {
			gs.error("Failed to parse response template query results");
		}
		
		var categories = [];
        var defaultSelectMessage = gs.getMessage("Select a response template");
        categories.push("----" + defaultSelectMessage + "----");
		
		for (var i = 0; i < parsedResults.length; i++) {
			if (parsedResults[i].name)
				categories.push(parsedResults[i].name);
		}

        return categories;
    },

    /*
     * Checks user's access permission to response template
     * @params:
     *  responseTemplateTable: string value of table name
     *  accessType: string value for type of access.
     *    Access types supported: 'read', 'write', 'delete'
     * @returns:
     *  boolean: true if user satisfies role requirements for accessType
     *           false otherwise
     */
    canAccessHRResponseTemplate: function(responseTemplateTable, accessType) {
        var pluginManager = new GlidePluginManager();
        var HRCoreActive = pluginManager.isActive('com.sn_hr_core');
        var LEActive = pluginManager.isActive('com.sn_hr_lifecycle_events');
        var isHRCoreTable = responseTemplateTable.startsWith('sn_hr_core');
        var isLETable = responseTemplateTable.startsWith('sn_hr_le');
        var user = gs.getUser();

        switch (accessType) {

            case 'read':
                if (isHRCoreTable)
                    return HRCoreActive && user.hasRole('sn_hr_core.case_writer');
                if (isLETable)
                    return LEActive && user.hasRole('sn_hr_le.case_writer');
                break;

            case 'write': //using fall-through as both the access type require similar roles for access
            case 'delete':
                if (isHRCoreTable)
                   return HRCoreActive && user.hasRole('sn_hr_core.manager');
                if (isLETable)
                    return LEActive && user.hasRole('sn_hr_le.admin');
                break;
        }

        return false;
    },
	
	/*
     * Gets a list of all active Response Template Channel records
     * @returns:
     *  string containing comma separated list of sys_ids for currently active channel records
     */
	getActiveChannels: function() {
		var channels = [];
		
		var gr = new GlideRecord('sn_templated_snip_channel');
		gr.addActiveQuery();
		gr.orderBy('name');
		gr.query();
		
		while (gr.next())
			channels.push(gr.getUniqueValue());
		
		return channels.join(',');
	},

    type: 'NoteTemplateCheck'
};
