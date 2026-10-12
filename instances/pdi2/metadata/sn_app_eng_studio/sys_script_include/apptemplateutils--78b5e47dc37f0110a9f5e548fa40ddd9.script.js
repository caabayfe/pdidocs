var AppTemplateUtils = Class.create();
AppTemplateUtils.prototype = {
    initialize: function() {},

    getProcessedAppTemplateEmailUserData: function(userSysIds, groupSysIds) {
        function hasReachedLimit(outputData) {
            var appTemplateEmailUserLimit = gs.getProperty("sn_app_eng_studio.app_template_email_user_limit", 300);


            return outputData.length >= appTemplateEmailUserLimit;
        }

        if (!Array.isArray(userSysIds) && !Array.isArray(groupSysIds)) {
            throw "Format of userSysIds and groupSysIds should be an array and atleast one should be passed";
        }

        var allUserData = [];

        for (var i = 0; i < (userSysIds || []).length; i++) {
            if (hasReachedLimit(allUserData))
                break;

            var userSysId = userSysIds[i];

            if (userSysId) {
                var userGr = new GlideRecord('sys_user');

                if (userGr.get(userSysId)) {
                    var userObject = {
                        sys_id: userSysId,
                        user_name: userGr.getValue('user_name'),
                        from_group_membership: false
                    };
                    allUserData.push(userObject);
                }
            }
        }

        for (var j = 0; j < (groupSysIds || []).length; j++) {
            if (hasReachedLimit(allUserData))
                break;

            var groupSysId = groupSysIds[j];

            if (groupSysId) {
                var groupMemberGr = new GlideRecord('sys_user_grmember');

                groupMemberGr.addQuery('group', groupSysId);

                groupMemberGr.query();

                while (groupMemberGr.next()) {
                    var groupUserObject = {
                        sys_id: groupMemberGr.user.getRefRecord().sys_id.toString(),
                        user_name: groupMemberGr.user.getRefRecord().user_name.toString(),
                        group_sys_id: groupSysId.toString(),
                        group_name: groupMemberGr.group.getRefRecord().name.toString(),
                        from_group_membership: true
                    };

                    allUserData.push(groupUserObject);

                    if (hasReachedLimit(allUserData))
                        break;
                }
            }
        }

        return allUserData;
    },

    type: 'AppTemplateUtils'
};
