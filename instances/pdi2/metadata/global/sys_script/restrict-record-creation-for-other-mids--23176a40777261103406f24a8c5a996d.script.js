
    // MIDServer-A with userA and with only mid_server role should be restricted to
    // create output records for MIDServer-B logged in as different user, for Topic
    // "Command".
    (function executeRule(current, previous /*null when async*/) {
        var userFromSysCreatedBy = GlideUser.getUser(current.sys_created_by);
        if (userFromSysCreatedBy.hasRole('agent_admin'))
            return;

        var agentName = current.agent;
        agentName = agentName.substring("mid.server.".length, agentName.length);
        var agentRecord = new SNC.ECCAgentCache().getByName(agentName);
        if (JSUtil.nil(agentRecord) || !agentRecord.isValidRecord())
            return;

        if(!agentRecord.user_name)
            return;

        // 'current.sys_created_by' field is user_name that created the request.
        // ecc queue request was created for mid server 'current.agent'.
        if (agentRecord.user_name != current.sys_created_by &&
                hasExplicitMidServerRoles(userFromSysCreatedBy)){
            gs.warn('Access Denied. MID user: "' + current.sys_created_by +
                '" with MID server role, cannot create an output record with topic: "' + current.topic +
                '" for agent: "' + current.agent  +
                '" with name: "' + current.name +
                '" ; logged in as: "' + agentRecord.user_name +  '".');
            current.setAbortAction(true);
        }

        function hasExplicitMidServerRoles(userFromSysCreatedBy) {
            var expectedRoles = [], roleName = "mid_server";
            getRoles(expectedRoles, roleName, []);
            if (expectedRoles.indexOf(roleName) === -1)
                expectedRoles.push(roleName);
            expectedRoles.sort();

            var sysCreatedByUserRoles = userFromSysCreatedBy.getAllRoles();
            var sysCreatedBySortedRoles = Array.from(sysCreatedByUserRoles).sort();

            if (expectedRoles.length != sysCreatedBySortedRoles.length)
                return false;

            for (var i = 0; i < expectedRoles.length; i++)
                if (expectedRoles[i] != sysCreatedBySortedRoles[i])
                    return false;

            return true;
        }

        function getRoles(rolesArray, roleName, visited) {
            if (roleName === null || roleName.trim() === "" || rolesArray == null)
                return;

            // Check if the role has already been visited in this recursion path
            if (visited.indexOf(roleName) !== -1)
                return;

            // Mark this role as visited
            visited.push(roleName);

            var grRoleContains = new GlideRecord('sys_user_role_contains');
            if (grRoleContains.isValid()) {
                grRoleContains.addQuery('role.name', roleName);
                grRoleContains.query();

                while (grRoleContains.next()) {
                    var currentRole = grRoleContains.contains.name.toString();
                    if (currentRole && rolesArray.indexOf(currentRole) === -1) {
                        rolesArray.push(currentRole);
                        getRoles(rolesArray, currentRole, visited.slice());
                    }
                }
            }
        }
  })(current, previous);
