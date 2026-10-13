var ConnectorInstanceUtil = Class.create();
ConnectorInstanceUtil.prototype = {

    EM_CONNECTOR_INSTANCE: "em_connector_instance",
    SN_EM_CONNECTOR_PUSH_INSTANCE: "sn_em_connector_push_instance",

    initialize: function() {
        // assignment_group will not be displayed on pre-W instances, with a default value of false when the property is absent
        this.CONNECTOR_ASSIGNMENT_GROUP_ENABLED_PROPERTY = "evt_mgmt.connector_enable_assignment_group_support";
        this.CONNECTOR_ASSIGNMENT_GROUP_ENABLED_DEFAULT_VALUE = "false";
        this.CONNECTOR_ASSIGNMENT_GROUP_ADMIN_ROLES_PROPERTY = "evt_mgmt.connector_assignment_group_admin_roles";
        this.CONNECTOR_ASSIGNMENT_GROUP_ADMIN_ROLES_DEFAULT_VALUE = "admin,evt_mgmt_admin,sn_sow_srm.srm_admin";
    },

    findInstanceByNameAcrossDomain: function(instanceName) {
        var existingInstance = this.findPullConnectorInstanceByNameAcrossDomain(instanceName);
        if (!existingInstance)
            existingInstance = this.findPushConnectorInstanceByNameAcrossDomain(instanceName);
        return existingInstance ? existingInstance : {};
    },

    findPullConnectorInstanceByNameAcrossDomain: function(instanceName) {
        return this._fetchInstance(this.EM_CONNECTOR_INSTANCE, instanceName);
    },

    findPushConnectorInstanceByNameAcrossDomain: function(instanceName) {
        return this._fetchInstance(this.SN_EM_CONNECTOR_PUSH_INSTANCE, instanceName);
    },

    // This will be called in BR on pull/push connector instance insert/update to enfore unique name across all domain.
    _fetchInstance: function(table, instanceName) {
        var gr = new GlideRecord(table);
        // In case of push connector instance, table will not be present if the sn_em_connector app is not installed or older version is installed. 
        // In case when table is not present, gr.isValid() will return false.
        if (gr.isValid()) {
            gr.addQuery("name", instanceName);
            // need to find pull/push connector instance across domain so ignoring domain while querying.
            gr.queryNoDomain();
            if (gr.next()) {
                return {
                    "sysId": String(gr.getUniqueValue()),
                    "domain": String(gr.getValue('sys_domain')),
                    "isBidirectional": gr.isValidField('bi_directional') ? (gr.getDisplayValue('bi_directional') == 'true') : false
                };
            }
        }
        return null;
    },

    isAssignmentGroupSupportEnabled: function() {
        var assnGroupEnabled = gs.getProperty(this.CONNECTOR_ASSIGNMENT_GROUP_ENABLED_PROPERTY,
            this.CONNECTOR_ASSIGNMENT_GROUP_ENABLED_DEFAULT_VALUE);
        return assnGroupEnabled == 'true';
    },

    getAssignmentGroupAdminRoles: function() {
        var assnGroupAdminRoles = gs.getProperty(this.CONNECTOR_ASSIGNMENT_GROUP_ADMIN_ROLES_PROPERTY,
            this.CONNECTOR_ASSIGNMENT_GROUP_ADMIN_ROLES_DEFAULT_VALUE);
        return assnGroupAdminRoles;
    },

    // Function to get user groups that the logged in user is a part of or is the manager of
    getCurrentUserGroupsForMemberOrManager: function() {
        var userGroups = this._getGroupsWithCurrentUserAsMember();
        var managedGroups = this._getGroupsWithCurrentUserAsManager();

        for (var i = 0; i < managedGroups.length; i++) {
            var group = managedGroups[i];

            // Check if the current group is not already in userGroups
            if (userGroups.indexOf(group) === -1) {
                userGroups.push(group);
            }
        }

        return userGroups;
    },

    _getGroupsWithCurrentUserAsMember: function() {
        var userGroupIds = [];
        var currentUserId = gs.getUser().getID();

        // Query for groups where current user is a member
        var memberGr = new GlideRecord('sys_user_grmember');
        memberGr.addQuery('user', currentUserId);
        memberGr.query();

        while (memberGr.next()) {
            userGroupIds.push(memberGr.getValue('group'));
        }

        return userGroupIds;
    },

    _getGroupsWithCurrentUserAsManager: function() {
        var managedGroupIds = [];
        var currentUserId = gs.getUser().getID();

        // Query for groups where the current user is a manager
        var userManagedGroups = new GlideRecord('sys_user_group');
        userManagedGroups.addQuery('manager', currentUserId);
        userManagedGroups.query();

        while (userManagedGroups.next()) {
            var groupId = userManagedGroups.getValue('sys_id');
            managedGroupIds.push(groupId);
        }

        return managedGroupIds;
    },

    // Check if current user is member / manager of user group with given ID
    isCurrentUserMemberOrManagerOfGroup: function(groupId) {
        var currentUserId = gs.getUser().getID();
        var isMember = false;
        var isManager = false;

        var memberGr = new GlideRecord('sys_user_grmember');
        memberGr.addQuery('user', currentUserId);
        memberGr.addQuery('group', groupId);
        memberGr.query();
        isMember = memberGr.hasNext();

        if (!isMember) {
            // Check if user is manager of the group
            var groupGr = new GlideRecord('sys_user_group');
            groupGr.addQuery('sys_id', groupId);
            groupGr.addQuery('manager', currentUserId);
            groupGr.query();
            isManager = groupGr.hasNext();
        }

        return isMember || isManager;
    },

    /**
     * @param {*} assnGroupId - ID of the user group
     * @param {*} assnGroupName - Name of the user group (used for health event reporting)
     * 
     * Disable connector instances associated with an assignment group and raise a self health alert on event sources.
     * This function is called from a BR on sys_user_group table to deactivate connector instances associated with a deleted group
     * 
     */
    disableConnectorInstanceWithAssnGroup: function(assnGroupId, assnGroupName) {
        if (!assnGroupId) {
            return;
        }

        var relatedPullInstances = this._disableConnectorInstance(this.EM_CONNECTOR_INSTANCE, assnGroupId);
        var relatedPushInstances = this._disableConnectorInstance(this.SN_EM_CONNECTOR_PUSH_INSTANCE, assnGroupId);

        // Check if there are any affected connector instances
        if (relatedPullInstances.length === 0 && relatedPushInstances.length === 0) {
            // No affected connector instances
            return;
        }

        var healthMsgKey = 'connector_instance_assn_group_deleted_' + assnGroupId;
        var affectedPullInstanceStr = relatedPullInstances.length > 0 ? gs.getMessage('\n\nPull connector instances:\n{0}', [relatedPullInstances.join(', ')]) : '';
        var affectedPushInstanceStr = relatedPushInstances.length > 0 ? gs.getMessage('\n\nPush connector instances:\n{0}', [relatedPushInstances.join(', ')]) : '';

        var shEventDescription = gs.getMessage("The following connector instances have been deactivated because the assignment group '{0}' has been deleted:{1}{2}", [assnGroupName, affectedPullInstanceStr, affectedPushInstanceStr]);

        this._sendSelfHealthEvent(healthMsgKey, shEventDescription, '', 'disableConnectorInstanceWithAssnGroup');
    },

    /**
     * Disable connector instance and return a list of names of affected connector instances
     */
    _disableConnectorInstance: function(tableName, assnGroupId) {
        var affectedInstances = [];

        // The table sn_em_connector_push_instance may not exist if em_connector scoped app is not installed
        if (!gs.tableExists(tableName)) {
            return affectedInstances;
        }

        var gr = new GlideRecord(tableName);

        // Check if the assignment_group field exists in the table
        if (!gr.isValidField('assignment_group')) {
            return affectedInstances;
        }
		
        gr.addActiveQuery();
        gr.addQuery('assignment_group', assnGroupId);
        gr.queryNoDomain();
        while (gr.next()) {
            affectedInstances.push(gr.getValue('name'));
            gr.setValue('active', false);
            gr.update();
        }

        return affectedInstances;
    },

    _sendSelfHealthEvent: function(msgKey, shEventDescription, additionalInfo, sourceDetails) {
        var healthEventSource = 'connector_instance_util_' + sourceDetails;

        if (typeof global.EvtMgmtHealthMonitorManager === 'function') {
            var emHMmanager = new global.EvtMgmtHealthMonitorManager();
            var healthEventSeverity = '4'; // Warning
            var monitorName = 'Connector Instance Utility';
            var bindingCiName = 'Event Sources';
            var expirationPeriodInSec = 0;
            var updateTimeInSec = 0;

            emHMmanager.sendEvent(msgKey, healthEventSeverity, shEventDescription, additionalInfo, monitorName, healthEventSource, bindingCiName, 'true', expirationPeriodInSec, updateTimeInSec);
        } else {
            // In case health monitor manager is not available, log to system logs.
            gs.warn(shEventDescription);
        }
    },

    type: 'ConnectorInstanceUtil'
};
