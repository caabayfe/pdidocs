function transform(input) {
    if (!GlidePluginManager.isActive('com.snc.uib.sow_srm') || !GlidePluginManager.isActive('com.snc.uib.sow_srm_common')) {
        return false;
    }
    var AVATAR_LIMIT = 11; // the number of avatars we want to show on the Team request cards

    // transform the requests results for the SOW teams UX
    var teamRequestList = new sn_sow_srm.SRMTeamManagement().getTeamRequests();

    // and decorate the teamRequestList items with the additional fields
    teamRequestList.forEach(function(teamRequest) {
        // get the card fields. Handle the case of an existing or new team
        // - existing team: assignment_group.name
        // - new team name:
        var item = new GlideRecordSecure('sc_req_item');
        if (!!teamRequest.requested_item && item.get(teamRequest.requested_item.value)) {
            switch (item.variables['create_team'] + '') {
                case sn_sow_srm_common.SRMCommonConstants.TEAM_PROVISIONING.NEW_TEAM:
                    handleCreateNewTeam(teamRequest, item.variables);
                    break;

                case sn_sow_srm_common.SRMCommonConstants.TEAM_PROVISIONING.EXISTING_TEAM:
                    handleUseExistingTeam(teamRequest, item.variables);
                    break;
            }
        }
    });
    return teamRequestList;


    function handleCreateNewTeam(teamRequest, variables) {
        for (var key in variables) {
            var v = variables[key];

            if (v != '' && !v.nil()) {
                switch (key) {
                    case 'manager':
                        handleManager(teamRequest, v.toString());
                        break;
                    case 'members':
                        handleMembersByIDs(teamRequest, v.toString());
                        break;
                    case 'email':
                        handleEmail(teamRequest, v.toString());
                        break;
                }
            }
        }
    }

    function handleUseExistingTeam(teamRequest, variables) {
        for (var key in variables) {
            var v = variables[key];

            if (v != '' && !v.nil()) {
                switch (key) {
                    case 'assignment_group':
                        // handle 'existing team' registration
                        handleAssignmentGroup(teamRequest, v.toString());
                        break;
                }
            }
        }
    }

    /**
     * Update teamRequest by reference
     */
    function handleManager(teamRequest, sysId) {
        var gr = new GlideRecord('sys_user'); // just getting manager name/sys_id. GlideRecord is low-risk
        if (!gr.get(sysId))
            return;

        teamRequest['manager'] = {
            "value": gr.getUniqueValue(),
            "displayValue": gr.getDisplayValue()
        };
    }

    function handleEmail(teamRequest, email) {
        if (!email)
            return;

        teamRequest['email'] = {
            "value": email,
            "displayValue": email
        };
    }

    function handleAssignmentGroup(teamRequest, assignmentGroup) {
        var group = new GlideRecord('sys_user_group'); // No significant user-input. GlideRecord is low-risk
        if (!group.get(assignmentGroup))
            return false;

        handleManager(teamRequest, group.getValue('manager'));
        handleEmail(teamRequest, group.getValue('email'));
        handleMembersByGroup(teamRequest, assignmentGroup);
    }

    /**
     * Handles group members by comma separated string of userIds
     */
    function handleMembersByIDs(teamRequest, memberIds) {
        if (gs.nil(memberIds))
            return;

        var members = memberIds.split(',');
        teamRequest['members'] = {
            "members": _getMembersByIDs(memberIds),
            "count": members.length
        };
    }

    function _getMembersByIDs(memberIds) {
        var retval = [];
        var gr = new GlideRecord('sys_user');
        gr.addQuery('sys_id', 'IN', memberIds);
        gr.orderBy('name');
        gr.setLimit(AVATAR_LIMIT);
        gr.query();
        if (!gr.hasNext())
            return;

        while (gr.next()) {
            var avatarPath = GlideAvatarFinder.getAvatarPath(gr.getUniqueValue());
            if (avatarPath)
                avatarPath = '/' + avatarPath;

            retval.push({
                "sys_id": gr.getUniqueValue(),
                "name": gr.getValue('name'),
                "avatar": avatarPath || ''
            });
        }
        return retval;
    }

    /**
     * Handles group members by groupId
     */
    function handleMembersByGroup(teamRequest, groupId) {
        teamRequest['members'] = {
            "members": _getMembersByGroup(groupId),
            "count": _getMemberCountByGroup(groupId)
        };
    }

    function _getMembersByGroup(groupId) {
        var members = [];
        var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('group', groupId);
        gr.setLimit(AVATAR_LIMIT);
        gr.query();
        if (!gr.hasNext())
            return;
		
        while (gr.next()) {
            members.push(gr.getValue('user'));
        }
        return _getMembersByIDs(members);
    }

    function _getMemberCountByGroup(groupId) {
        var count = new GlideAggregate('sys_user_grmember');
        count.addQuery('group', groupId);
        count.addAggregate('COUNT');
        count.query();
        var memberCount = 0;
        if (count.next())
            memberCount = count.getAggregate('COUNT');

        return memberCount;
    }
}
