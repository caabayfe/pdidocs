(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Configuration
    var CHUNK_SIZE = 2000; // Number of users to process per batch

    // Split array into smaller chunks
    function chunkArray(arr, size) {
        var out = [];
        for (var i = 0; i < arr.length; i += size)
            out.push(arr.slice(i, i + size));
        return out;
    }

    // Get all inactive users
    var inactiveUserIds = [];
    var grUser = new GlideRecord('sys_user');
    grUser.addQuery('active', false);
    grUser.query();
    while (grUser.next()) {
        inactiveUserIds.push(grUser.getUniqueValue());
    }

    if (inactiveUserIds.length === 0)
        return;

    var userChunks = chunkArray(inactiveUserIds, CHUNK_SIZE);

    // Process each batch of inactive users
    for (var i = 0; i < userChunks.length; i++) {
        var chunk = userChunks[i];

        // Fetch all active roles assigned to the users
        var userHasRoleGr = new GlideRecord('sys_user_has_role');
        userHasRoleGr.addQuery('user', 'IN', chunk.join(','));
        userHasRoleGr.addQuery('state', 'active');
        userHasRoleGr.query();

        var userRolesMap = {}; // userId → [roleId, ...]
        var roleIds = {};

        while (userHasRoleGr.next()) {
            var userId = userHasRoleGr.getValue('user');
            var roleId = userHasRoleGr.getValue('role');
            if (!userRolesMap[userId]) userRolesMap[userId] = [];
            userRolesMap[userId].push(roleId);
            roleIds[roleId] = true;
        }

        if (Object.keys(userRolesMap).length === 0)
            continue;

        // Fetch role details
        var roleMap = {}; // roleId → {name, link}
        var grUserRole = new GlideRecord('sys_user_role');
        grUserRole.addQuery('sys_id', 'IN', Object.keys(roleIds).join(','));
        grUserRole.query();
        while (grUserRole.next()) {
            roleMap[grUserRole.getUniqueValue()] = {
                name: grUserRole.getDisplayValue('name'),
                link: accessAuditorUtil.getRecordLink(grUserRole, grUserRole.getDisplayValue('name'))
            };
        }

        // Fetch user group details
        var userGroupsMap = {}; // userId → [groupId, ...]
        var groupIds = {};
        var ug = new GlideRecord('sys_user_grmember');
        ug.addQuery('user', 'IN', chunk.join(','));
        ug.query();
        while (ug.next()) {
            var usrId = ug.getValue('user');
            var grpId = ug.getValue('group');
            if (!userGroupsMap[usrId]) userGroupsMap[usrId] = [];
            userGroupsMap[usrId].push(grpId);
            groupIds[grpId] = true;
        }

        // Fetch group role details
        var groupHasRoleMap = {}; // groupId → {roleId: true}
        var grpHasRole = new GlideRecord('sys_group_has_role');
        grpHasRole.addQuery('group', 'IN', Object.keys(groupIds).join(','));
        grpHasRole.query();
        while (grpHasRole.next()) {
            var gid = grpHasRole.getValue('group');
            var rid = grpHasRole.getValue('role');
            if (!groupHasRoleMap[gid]) groupHasRoleMap[gid] = {};
            groupHasRoleMap[gid][rid] = true;
        }

        var groupNameMap = {}; // groupId → { name, link }
        var groupNameGr = new GlideRecord('sys_user_group');
        groupNameGr.addQuery('sys_id', 'IN', Object.keys(groupIds).join(','));
        groupNameGr.query();
        while (groupNameGr.next()) {
            var gId = groupNameGr.getUniqueValue();
            var gName = groupNameGr.getDisplayValue('name');
            groupNameMap[gId] = {
                name: gName,
                link: accessAuditorUtil.getRecordLink(groupNameGr, gName)
            };
        }

        // Build role details per user; collect those needing findings for a single batch query
        var userIds = Object.keys(userRolesMap);
        var pendingFindings = {}; // userId → precomputed roleDetails array
        var pendingUserIds = [];

        for (var j = 0; j < userIds.length; j++) {
            var uId = userIds[j];
            var assignedRoles = userRolesMap[uId];
            if (!assignedRoles || assignedRoles.length === 0)
                continue;

            var roleDetails = [];

            for (var r = 0; r < assignedRoles.length; r++) {
                var rId = assignedRoles[r];
                var roleMeta = roleMap[rId];
                var roleLabel = roleMeta ? roleMeta.link : rId;

                // Dynamically detect inheritance
                var inheritedFromGroups = [];
                var uGroups = userGroupsMap[uId] || [];
                for (var g = 0; g < uGroups.length; g++) {
                    var gId = uGroups[g];
                    if (groupHasRoleMap[gId] && groupHasRoleMap[gId][rId]) {
                        var gMeta = groupNameMap[gId];
                        var gLabel = gMeta ? gMeta.link : gId;
                        inheritedFromGroups.push(gLabel);
                    }
                }

                if (inheritedFromGroups.length > 0)
                    roleDetails.push(roleLabel + ' inherited from: ' + inheritedFromGroups.join(', '));
                else
                    roleDetails.push(roleLabel + ' (direct assignment)');
            }

            if (roleDetails.length > 0) {
                pendingFindings[uId] = roleDetails;
                pendingUserIds.push(uId);
            }
        }

        // Batch-query users with findings instead of one GlideRecord.get() per user;
        // also eliminates the separate userNameGr query since we use uRec directly here
        if (pendingUserIds.length > 0) {
            var uRec = new GlideRecord('sys_user');
            uRec.addQuery('sys_id', 'IN', pendingUserIds.join(','));
            uRec.query();
            while (uRec.next()) {
                var uid = uRec.getUniqueValue();
                var roleDetails = pendingFindings[uid];
                var uLink = accessAuditorUtil.getRecordLink(uRec, uRec.getDisplayValue('name'));
                var details = 'User ' + uLink +
                    ' is inactive but still holds active role assignments.\n\nRoles:\n';
                for (var k = 0; k < roleDetails.length; k++)
                    details += (k + 1) + '. ' + roleDetails[k] + '\n';
                details += '\nRemediate by reviewing and removing all active roles from this inactive user.';

                finding.setCurrentSource(uRec);
                finding.setValue('finding_details', details);
                finding.increment();
            }
        }

        // Free memory
        userRolesMap = null;
        roleMap = null;
        userGroupsMap = null;
        groupHasRoleMap = null;
        groupNameMap = null;
        pendingFindings = null;
        pendingUserIds = null;
    }
})(finding);
