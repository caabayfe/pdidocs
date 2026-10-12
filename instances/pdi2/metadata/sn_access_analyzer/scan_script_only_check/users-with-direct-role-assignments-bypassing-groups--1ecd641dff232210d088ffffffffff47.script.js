(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Constants
    var CHUNK_SIZE = 2000;

    // Helper: split array into smaller chunks
    function chunkArray(arr, size) {
        var out = [];
        var len = arr.length;
        for (var i = 0; i < len; i += size) {
            out.push(arr.slice(i, i + size));
        }
        return out;
    }

    // Use object literals instead of arrays for faster lookups
    var rolesByUser = Object.create(null);
    var roleIdsSet = Object.create(null);

    // Collect direct, active roles
    var gr = new GlideRecord('sys_user_has_role');
    gr.addQuery('inherited', false);
    gr.addQuery('state', 'active');
    gr.query();

    while (gr.next()) {
        var userId = gr.getValue('user');
        var roleId = gr.getValue('role');

        // Initialize only once (avoids property existence checks later)
        var userRoles = rolesByUser[userId];
        if (userRoles)
            userRoles.push(roleId);
        else
            rolesByUser[userId] = [roleId];

        roleIdsSet[roleId] = true;
    }

    var userIds = Object.keys(rolesByUser);
    if (userIds.length === 0) return;

    var userChunks = chunkArray(userIds, CHUNK_SIZE);

    // Preload all role data once
    var roleMap = Object.create(null);
    var roleIds = Object.keys(roleIdsSet);
    if (roleIds.length) {
        var roleGR = new GlideRecord('sys_user_role');
        roleGR.addQuery('sys_id', 'IN', roleIds.join(','));
        roleGR.query();
        while (roleGR.next()) {
            var sysId = roleGR.getUniqueValue();
            var name = roleGR.getDisplayValue('name');
            roleMap[sysId] = {
                name: name,
                link: accessAuditorUtil.getRecordLink(roleGR, name)
            };
        }
    }

    // Process each user chunk
    for (var i = 0, totalChunks = userChunks.length; i < totalChunks; i++) {
        var chunk = userChunks[i];
        //var chunkStr = chunk.join(',');

        // Collect role links per user; defer GlideRecord access to a single batch query
        var pendingFindings = Object.create(null); // userId → roleLinks array
        var pendingUserIds = [];

        for (var j = 0, chunkLen = chunk.length; j < chunkLen; j++) {
            var userId = chunk[j];
            var userRoles = rolesByUser[userId];
            if (!userRoles || userRoles.length === 0) continue;

            // Pre-allocate string array instead of += concatenation
            var roleLinks = new Array(userRoles.length);
            for (var r = 0, rLen = userRoles.length; r < rLen; r++) {
                var rId = userRoles[r];
                var meta = roleMap[rId];
                roleLinks[r] = meta ? meta.link : rId;
            }

            pendingFindings[userId] = roleLinks;
            pendingUserIds.push(userId);
        }

        // Batch-query users with findings instead of one GlideRecord.get() per user;
        // also eliminates the separate userNameMap query since we use uRec directly here
        if (pendingUserIds.length > 0) {
            var userRec = new GlideRecord('sys_user');
            userRec.addQuery('sys_id', 'IN', pendingUserIds.join(','));
            userRec.query();
            while (userRec.next()) {
                var uid = userRec.getUniqueValue();
                var roleLinks = pendingFindings[uid];
                var userLink = accessAuditorUtil.getRecordLink(userRec, userRec.getDisplayValue('name'));

                // Use array join for concatenation efficiency
                var remediationParts = [
                    "User ", userLink,
                    " has been flagged because they hold roles assigned directly rather than through a group. ",
                    "Direct role assignments reduce visibility and complicate access reviews and audits. ",
                    "Direct roles: ", roleLinks.join(', '), ". ",
                    "Remediate by reviewing and removing direct role assignments. ",
                    "Use group membership wherever possible to enhance governance and auditability."
                ];

                finding.setCurrentSource(userRec);
                finding.setValue("finding_details", remediationParts.join(''));
                finding.increment();
            }
        }
    }

})(finding);
