var UserCriteriaMappingUtils = Class.create();
UserCriteriaMappingUtils.prototype = {

    supportedEntityTables: [],

    supportedTablesByGroups: {},

    infoMsg: '<br>',

    result: {},

    initialize: function() {
        this.supportedTablesByGroups = this._getSupportedMobileEntityTables();
        this.infoMsg = this._buildSupportedMobileEntityTablesMessage();
    },

    _getSupportedMobileEntityTables: function() {
        var supportedBaseEntityTablesByGroups = {
            'sys_sg_native_client': [],
            'sys_sg_applet_launcher': [],
            'sys_sg_navigation_tab': [],
            'sys_sg_section': [],
            'sys_sg_navigation_section_destination': []
        };

        var keys = Object.keys(supportedBaseEntityTablesByGroups);
        this.supportedEntityTables = [].concat(keys);
        for (var ind = 0; ind < keys.length; ind++) {
            var tableKey = keys[ind];
            if (tableKey === 'sys_sg_navigation_tab')
                continue;

            var descendantTables = GlideDBObjectManager.get().getTableExtensions(tableKey);
            for (var ind2 = 0; ind2 < descendantTables.size(); ind2++) {
                this.supportedEntityTables.push('' + descendantTables.get(ind2));
                supportedBaseEntityTablesByGroups[tableKey].push('' + descendantTables.get(ind2));
            }
        }

        this.supportedEntityTables.push('sys_sg_applet_launcher_tab');
        this.supportedEntityTables.push('sys_sg_applet_tab');

        supportedBaseEntityTablesByGroups['sys_sg_navigation_tab'] = [];
        supportedBaseEntityTablesByGroups['sys_sg_navigation_tab'].push('sys_sg_applet_launcher_tab');
        supportedBaseEntityTablesByGroups['sys_sg_navigation_tab'].push('sys_sg_applet_tab');
        return supportedBaseEntityTablesByGroups;
    },

    _buildSupportedMobileEntityTablesMessage: function() {
        var gr = new GlideRecord('sys_db_object');
        gr.addQuery('name', 'IN', this.supportedEntityTables);
        gr.query();

        var tableNameToDisplayName = {};
        while (gr.next()) {
            tableDisplayName = gr.getValue('label');
            tableName = gr.getValue('name');
            tableNameToDisplayName[tableName] = tableDisplayName;
        }

        var keys = Object.keys(this.supportedTablesByGroups);
        var infoMsg = gs.getMessage('The tables compatible with user criteria mapping for Mobile entities include:') + '<br><br>';
        var counter = 1;
        for (ind = 0; ind < keys.length; ind++) {
            var currentGroup = this.supportedTablesByGroups[keys[ind]];
            var groupTitle = tableNameToDisplayName[keys[ind]];
            if (currentGroup.length < 1) {
                infoMsg += gs.getMessage("{0}. {1} <br>", [counter.toPrecision(1), groupTitle]);
                counter++;
                continue;
            }

            var groupMembers = [];
            for (var ind2 = 0; ind2 < currentGroup.length; ind2++)
                groupMembers.push(tableNameToDisplayName[currentGroup[ind2]]);

            infoMsg += gs.getMessage("{0}. {1} (Supported Types: {2})<br>", [counter.toPrecision(1), groupTitle, groupMembers.join(', ')]);
            counter++;
        }

        return infoMsg;
    },

    getMobileEntityMessage: function() {
        return this.infoMsg;
    },

    isSupportedMobileEntityTable: function(mobileEntityTable, mobileEntityId) {
        if (mobileEntityTable === 'sys_sg_navigation_tab') {
            this._checkSupportedTablesForNavigationTab(mobileEntityId);
            return this.result;
        }

        this.result.answer = this.supportedEntityTables.indexOf(mobileEntityTable) != -1;
        this.result.mobileEntityTable = this._getTableDisplayName(mobileEntityTable);
        this.result.type = 'table';
        return this.result;
    },

    _checkSupportedTablesForNavigationTab: function(mobileEntityId) {
        var gr = new GlideRecord('sys_sg_navigation_tab');
        gr.addQuery('sys_id', mobileEntityId);
        gr.query();

        if (gr.next()) {
            var sysClassName = gr.getValue('sys_class_name');
            this.result.answer = this.supportedEntityTables.indexOf(sysClassName) != -1;
            this.result.mobileEntityTable = gr.getValue('label');
            this.result.type = 'entity';
        }
    },

    _getTableDisplayName: function(tableName) {
        var gr = new GlideRecord('sys_db_object');
        gr.addQuery('name', tableName);
        gr.query();

        if (gr.next()) return gr.getValue('label');

        return '';
    },

    isSupportedMobileEntityTableByAccessControl: function(mobileEntityTable) {
        var supportedEntityTablesByAccessControl = ['sys_sg_native_client', 'sys_sg_applet_launcher', 'sys_sg_section'];

        if (supportedEntityTablesByAccessControl.indexOf(mobileEntityTable) != -1)
            return true;

        for (var ind = 0; ind < supportedEntityTablesByAccessControl.length; ind++) {
            var group = this.supportedTablesByGroups[supportedEntityTablesByAccessControl[ind]];
            if (group.indexOf(mobileEntityTable) != -1)
                return true;
        }

        return false;
    },

    type: 'UserCriteriaMappingUtils'
};
