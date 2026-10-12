var CollaborationRequestApprovalUtils = Class.create();
CollaborationRequestApprovalUtils.prototype = {
    initialize: function() {},

    isOriginEnvironmentFound: function(request) {
        return this.getOriginEnvironment(request).getRowCount() !== 0;
    },

    getOriginEnvironment: function(request) {
        var originatingInstanceId = this.getOriginatingInstanceId(request);
        var originEnvGr = new GlideRecord('sn_pipeline_environment');
        originEnvGr.get('instance_id', originatingInstanceId);
        return originEnvGr;
    },

    getOriginatingInstanceId: function(request) {
        try {
            var originatingInstanceId = request.getValue('originating_instance_id');
        } catch (e) {

        }
        return originatingInstanceId;
    },

    isOriginEnvironmentCurrentInstance: function(request) {
        return this.getOriginatingInstanceId(request) === gs.getProperty('instance_id');
    },

    isOriginEnvironmentSet: function(request) {
        try {
            var originEnv = request.originating_environment.getRefRecord();
        } catch (e) {

        }
        return originEnv && !!originEnv.sys_id && originEnv.instance_id === this.getOriginatingInstanceId(request);
    },

    userOrGroupHasPermission: function(request) {
        var isAesInstalled = global.JSUtil.getBooleanValue(request, 'originating_instance_has_aes_installed');
        var isGroup = global.JSUtil.getBooleanValue(request, 'is_invitee_group');
        var userOrGroupHasPerm = false;
        if (isAesInstalled) {
            if (isGroup) {
                userOrGroupHasPerm = global.JSUtil.getBooleanValue(request, 'group_invitee_has_aes_role');
            } else {
                userOrGroupHasPerm = global.JSUtil.getBooleanValue(request, 'invitee_has_aes_role');
            }
        } else {
            if (isGroup) {
                userOrGroupHasPerm = global.JSUtil.getBooleanValue(request, 'group_invitee_has_delegated_dev_role');
            } else {
                userOrGroupHasPerm = global.JSUtil.getBooleanValue(request, 'invitee_has_delegated_dev_role');
            }
        }
        return userOrGroupHasPerm;
    },

    mustRequestApproval: function(request) {
        //user or group either doesn't have permission or the origin environment isn't found on the controller
        return !global.JSUtil.getBooleanValue(request, 'auto_approve') || (!this.isOriginEnvironmentCurrentInstance(request) && !this.isOriginEnvironmentFound(request));
    },

    getAddingUserOrGroupToDescriptorFailedMessage: function(request, errorMessage) {
        var isGroup = request.is_invitee_group;
        var invitee = isGroup ? 'group' : 'user';
        var message = gs.getMessage('Something went wrong adding {0} to collaboration descriptor.\n{1}', [invitee, errorMessage]);
        return message;
    },

    getAssigningUserOrGroupAESRoleFailedMessage: function(request, errorMessage) {
        var isGroup = request.is_invitee_group;
        var invitee = isGroup ? 'group' : 'user';
        var message = gs.getMessage('Something went wrong assigning role sn_app_eng_studio.user to {0}.\n{1}', [invitee, errorMessage]);
        return message;
    },

    type: 'CollaborationRequestApprovalUtils'
};
