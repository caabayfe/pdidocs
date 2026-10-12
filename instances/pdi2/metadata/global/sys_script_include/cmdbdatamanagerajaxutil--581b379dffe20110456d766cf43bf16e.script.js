var CMDBDataManagerAjaxUtil = Class.create();
CMDBDataManagerAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'CMDBDataManagerAjaxUtil',
    CMDB_POLICY_MANAGEMENT_TASK: 'cmdb_data_management_task',

    getPolicyTypeId: function() {
        if (gs.hasRole('data_manager_user')) {
            var sysId = this.getParameter('sysId');
            var gr = new GlideRecordSecure(this.CMDB_POLICY_MANAGEMENT_TASK);
            if (gr.get(sysId))
                return gr.policy_id.cmdb_policy_type;
        }
        return '';
    },

    getGroupsWithDMUserRole: function() {
        var groupIds = [];
        if (gs.hasRole('data_manager_user')) {
            var groups = new CMDBDataManagerHelper().getDataManagerUserGroups();
            for (var i = 0; i < groups.length; i++) {
                groupIds.push(groups[i].value);
            }
        }
        return groupIds;
    }

});
