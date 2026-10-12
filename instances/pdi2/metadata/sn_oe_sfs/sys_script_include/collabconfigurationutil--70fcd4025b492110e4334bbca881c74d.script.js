var CollabConfigurationUtil = Class.create();
CollabConfigurationUtil.prototype = {
    initialize: function() {
    },
	/*
	* Returns an array of table names to show in sys_cs_collab_config table column
	*/
	process: function() {
		var result = ['sys_user', 'sys_user_group'];
	
		return result;
	},
	insertOrDeleteRecord: function(channel, items) {
        var result = {};
        var groupStatus = true;
		var userStatus = true;
        if (items.groupToDelete.length != 0)
            groupStatus = this.deleteRecords(items.groupToDelete);
        if (groupStatus && items.groupToCreate.length != 0)
            groupStatus = this.insertGroupRecords(items.groupToCreate, channel);
		if (items.userToDelete.length != 0)
            userStatus = this.deleteRecords(items.userToDelete);
        if (userStatus && items.userToCreate.length != 0)
            userStatus = this.insertUserRecords(items.userToCreate, channel);

        if (groupStatus && userStatus) {
            result.status = 200;
            result.body = {
                message: gs.getMessage('Success! Configuration saved'),
				error: false
            };
        } else {
            result.status = 500;
            result.body = {
                message: gs.getMessage('Failed! Configuration not saved'),
				error: true
            };
        }
        return result;
    },
    applyGroupFilter: function(channel, query) {
        var result = {};
        var table = 'sys_user_group';
        var response = this.buildQueryResult(channel, query, table);
        if (response) {
            result.status = 200;
            result.body = {
                message: gs.getMessage('Filters applied sucessfully'),
                items: response
            };
        } else {
            result.status = 500;
            result.body = {
                message: gs.getMessage('Failed to apply filter'),
                items: ' '
            };
        }
        return result;
    },
	applyUserFilter: function(channel, query) {
        var result = {};
        var table = 'sys_user';
        var response = this.buildQueryResult(channel, query, table);
        if (response) {
            result.status = 200;
            result.body = {
                message: gs.getMessage('Filters applied sucessfully'),
                items: response
            };
        } else {
            result.status = 500;
            result.body = {
                message: gs.getMessage('Failed to apply filter'),
                items: ' '
            };
        }
        return result;
    },
    buildQueryResult: function(channel, query, table) {
        var selectedResult = [];
        var configTable = "sys_cs_collab_config";
        var selectedItems = [];
        var availableResult = {};
        var groups = {};
        //For Selected Groups
        var grt = new GlideRecord(configTable);
        grt.addQuery('channel', channel);
        grt.addQuery('parent_table', table);
        grt.query();
        while (grt.next()) {
            var selected = [];
            var item = {};
            item.id = grt.getValue('parent_document');
            item.label = grt.getDisplayValue('parent_document.name');
            selected.push(item);
            selectedItems.push(item.id);
            selectedResult.push(selected);
        }
        //For Available Groups
        var gr = new GlideRecord(table);
        gr.addEncodedQuery(query);
        gr.addQuery('sys_id', 'NOT IN', selectedItems);
        gr.addActiveQuery();
        gr.setLimit(1000);
        gr.query();
        while (gr.next()) {
            var groupId = gr.getUniqueValue();
            var item1 = {};
            var definitionName = gr.getDisplayValue('name');
            item1.label = definitionName;
            groups[groupId] = item1;
        }
        availableResult.group = groups;
        var result = {
            availableResult: availableResult,
            selectedResult: selectedResult
        };
        return result;
    },

    deleteRecords: function(recordToDelete) {
        var status = false;
        var grTable = new GlideRecord('sys_cs_collab_config');
        grTable.addQuery('parent_document', recordToDelete);
        grTable.query();
        while (grTable.next()) {
            status = grTable.deleteRecord();
            if (!status)
                break;
        }
        return status;
    },
    insertGroupRecords: function(groupToCreate, channel) {
        var groupTable = 'sys_user_group';
        var status = true;
        for (i = 0; i < groupToCreate.length; i++) {
            var grTable = new GlideRecord('sys_cs_collab_config');
            grTable.setValue('channel', channel);
            grTable.setValue('create_external_conversation', 'true');
            grTable.setValue('parent_table', groupTable);
            grTable.setValue('parent_document', groupToCreate[i]);
            status = grTable.insert();
        }
        return status;
    },
	insertUserRecords: function(userToCreate, channel) {
        var userTable = 'sys_user';
        var status = true;
        for (i = 0; i < userToCreate.length; i++) {
            var grTable = new GlideRecord('sys_cs_collab_config');
            grTable.setValue('channel', channel);
            grTable.setValue('create_external_conversation', 'true');
            grTable.setValue('parent_table', userTable);
            grTable.setValue('parent_document', userToCreate[i]);
            status = grTable.insert();
        }
        return status;
    },
	deleteConfiguraton: function(channel) {
        var configTable = new GlideRecord('sys_cs_collab_config');
        configTable.addQuery('channel', channel);
        configTable.query();
        configTable.deleteMultiple();
    },
    type: 'CollabConfigurationUtil'
};
