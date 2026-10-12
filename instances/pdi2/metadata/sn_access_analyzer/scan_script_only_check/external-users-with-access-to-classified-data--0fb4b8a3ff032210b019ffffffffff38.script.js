(function (finding, current) {
    var AccessUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Build operation map
    function buildOpMap() {
        var m = {};
        var gr = new GlideRecord('sys_security_operation');
        gr.query();
        while (gr.next()) {
            var opName = gr.getValue('name');
            m[opName] = gr.getUniqueValue();
        }
        return m;
    }
    var opMap = buildOpMap();

    // 1) External users
    var externalUsers = {};
    var externalUserIds = [];
    var grExt = new GlideRecord('sys_user_has_role');
    grExt.addQuery('role.name', 'snc_external');
    grExt.query();
    while (grExt.next()) {
        var uid = grExt.getValue('user');
        if (!externalUsers[uid]) {
            externalUsers[uid] = { roles: {}, access: { tables: {}, fields: {} } };
            externalUserIds.push(uid);
        }
    }
    if (externalUserIds.length === 0) return;

    // 2) Classified columns
    var classified = [];
    var classifiedTables = [];
    var classifiedFulls = [];
    var grM2M = new GlideRecord('m2m_dictionary_dataclass');
    grM2M.query();
    while (grM2M.next()) {
        if (!grM2M.sys_dictionary || grM2M.sys_dictionary.nil()) {
            gs.warn('Skipping m2m record with missing sys_dictionary reference: ' + grM2M.getUniqueValue());
            continue;
        }
        
        var t = grM2M.sys_dictionary.name.toString();
        var f = grM2M.sys_dictionary.element.toString();
        
        if (!t || t === '' || !f || f === '') {
            gs.warn('Skipping classified column with null/empty table or field: table="' + t + '", field="' + f + '"');
            continue;
        }
        
        var full = t + '.' + f;
        classified.push({ table: t, field: f, full: full });
        if (classifiedTables.indexOf(t) === -1) classifiedTables.push(t);
        classifiedFulls.push(full);
    }
    if (classified.length === 0) return;

    // 3) ACLs to store sys_id
    var aclRolesById = {};
    var colAclIdsByFull = {};
    var colAclDataById = {};
    var tblAclIdsByTable = {};
    var tblAclDataById = {};
    var globalAclIdsByTable = {};
    var globalAclDataById = {};

    function collectAclRoles(aclId) {
        var roles = [];
        AccessUtil.collectRolesFromAcl(aclId, roles);
        aclRolesById[aclId] = roles;
    }

    // Column ACLs
    var grColAcl = new GlideRecord('sys_security_acl');
    grColAcl.addQuery('name', 'IN', classifiedFulls.join(','));
    grColAcl.addQuery('type', 'record');
    grColAcl.addQuery('active', true);
    grColAcl.addQuery('advanced', false);
    grColAcl.addQuery('decision_type', 'allow');
    grColAcl.query();
    while (grColAcl.next()) {
        var aclId = grColAcl.getUniqueValue();
        var name = grColAcl.getValue('name');
        var opDisplay = grColAcl.getDisplayValue('operation') || 'read';
        (colAclIdsByFull[name] = colAclIdsByFull[name] || []).push(aclId);
        colAclDataById[aclId] = {
            display: name + '.' + opDisplay,
            sysId: aclId
        };
        collectAclRoles(aclId);
    }

    // Global ACLs
    var globalAclNames = [];
    for (var i = 0; i < classifiedTables.length; i++) {
        globalAclNames.push(classifiedTables[i] + '.*');
    }
    var grGlobalAcl = new GlideRecord('sys_security_acl');
    grGlobalAcl.addQuery('name', 'IN', globalAclNames.join(','));
    grGlobalAcl.addQuery('type', 'record');
    grGlobalAcl.addQuery('active', true);
    grGlobalAcl.addQuery('advanced', false);
    grGlobalAcl.addQuery('decision_type', 'allow');
    grGlobalAcl.query();
    while (grGlobalAcl.next()) {
        var gAclId = grGlobalAcl.getUniqueValue();
        var gName = grGlobalAcl.getValue('name');
        var gOpDisplay = grGlobalAcl.getDisplayValue('operation') || 'read';
        var gTable = gName.replace('.*', '');
        (globalAclIdsByTable[gTable] = globalAclIdsByTable[gTable] || []).push(gAclId);
        globalAclDataById[gAclId] = {
            display: gName + '.' + gOpDisplay,
            sysId: gAclId
        };
        collectAclRoles(gAclId);
    }

    // Table ACLs
    var grTblAcl = new GlideRecord('sys_security_acl');
    grTblAcl.addQuery('name', 'IN', classifiedTables.join(','));
    grTblAcl.addQuery('type', 'record');
    grTblAcl.addQuery('active', true);
    grTblAcl.addQuery('advanced', false);
    grTblAcl.addQuery('decision_type', 'allow');
    grTblAcl.query();
    while (grTblAcl.next()) {
        var tAclId = grTblAcl.getUniqueValue();
        var tName = grTblAcl.getValue('name');
        var tOpDisplay = grTblAcl.getDisplayValue('operation') || 'read';
        (tblAclIdsByTable[tName] = tblAclIdsByTable[tName] || []).push(tAclId);
        tblAclDataById[tAclId] = {
            display: tName + '.' + tOpDisplay,
            sysId: tAclId
        };
        collectAclRoles(tAclId);
    }

    // 4) Roles per external user
    var userRoles = {};
    var grUR = new GlideRecord('sys_user_has_role');
    grUR.addQuery('user', 'IN', externalUserIds.join(','));
    grUR.query();
    while (grUR.next()) {
        var u = grUR.getValue('user');
        var rId = grUR.getValue('role');
        var rName = grUR.role.name.toString();
        var inherited = grUR.getValue('inherited') === 'true';
        (userRoles[u] = userRoles[u] || []);
        var existing = null;
        for (var i0 = 0; i0 < userRoles[u].length; i0++) {
            if (userRoles[u][i0].roleId === rId) { existing = userRoles[u][i0]; break; }
        }
        if (!existing) {
            userRoles[u].push({ roleId: rId, roleName: rName, inherited: inherited });
        } else if (existing.inherited && !inherited) {
            existing.inherited = false;
        }
    }

    // 5) Roles that grant classified access
    var rolesGrantingAccess = {};
    function addRolesFromAclIds(aclIds) {
        for (var i = 0; i < aclIds.length; i++) {
            var list = aclRolesById[aclIds[i]] || [];
            for (var j = 0; j < list.length; j++) rolesGrantingAccess[list[j]] = true;
        }
    }
    for (var i1 = 0; i1 < classified.length; i1++) {
        var full = classified[i1].full;
        var tbl = classified[i1].table;
        if (colAclIdsByFull[full]) addRolesFromAclIds(colAclIdsByFull[full]);
        if (globalAclIdsByTable[tbl]) addRolesFromAclIds(globalAclIdsByTable[tbl]);
        if (tblAclIdsByTable[tbl]) addRolesFromAclIds(tblAclIdsByTable[tbl]);
    }

    // 6) Determine user access
    var usersWithAccess = {};
    function ensureArr(obj, key) { obj[key] = obj[key] || []; return obj[key]; }
      
    function pushUnique(arr, v) { if (arr.indexOf(v) === -1) arr.push(v); }
      
    function userHasRoleForAcl(aclId) {
        var aclRoles = aclRolesById[aclId] || [];
        for (var rr = 0; rr < aclRoles.length; rr++) {
            if (uRoles.some(function (ur) { return ur.roleId === aclRoles[rr]; })) {
                return true;
            }
        }
        return false;
    }

    for (var uid2 in userRoles) {
        var uRoles = userRoles[uid2] || [];
        var hasAny = uRoles.some(function (r) { return !!rolesGrantingAccess[r.roleId]; });
        if (!hasAny) continue;

        usersWithAccess[uid2] = true;

        for (var c2 = 0; c2 < classified.length; c2++) {
            var full2 = classified[c2].full;
            var tbl2 = classified[c2].table;

            var colAclIds = colAclIdsByFull[full2] || [];
            var globalAclIds = globalAclIdsByTable[tbl2] || [];
            var tblAclIds = tblAclIdsByTable[tbl2] || [];

            // Store ACL sys_ids instead of display strings
            for (var kk = 0; kk < colAclIds.length; kk++) {
                if (userHasRoleForAcl(colAclIds[kk])) {
                    var arrF = ensureArr(externalUsers[uid2].access.fields, full2);
                    pushUnique(arrF, colAclIds[kk]);
                }
            }

            for (var gg = 0; gg < globalAclIds.length; gg++) {
                if (userHasRoleForAcl(globalAclIds[gg])) {
                    var arrF = ensureArr(externalUsers[uid2].access.fields, full2);
                    pushUnique(arrF, globalAclIds[gg]);
                    
                    var arrT = ensureArr(externalUsers[uid2].access.tables, tbl2);
                    pushUnique(arrT, globalAclIds[gg]);
                }
            }

            for (var tt = 0; tt < tblAclIds.length; tt++) {
                if (userHasRoleForAcl(tblAclIds[tt])) {
                    var arrT = ensureArr(externalUsers[uid2].access.tables, tbl2);
                    pushUnique(arrT, tblAclIds[tt]);
                }
            }
        }
    }

    // 7) Role sources
    // rData.inherited is already accurate from step 4 (set to false if any direct assignment exists),
    // so we use it directly instead of re-querying sys_user_has_role per role per user.
    for (var uid3 in usersWithAccess) {
        var uRoleList = userRoles[uid3] || [];
        for (var rix = 0; rix < uRoleList.length; rix++) {
            var rData = uRoleList[rix];
            if (!rolesGrantingAccess[rData.roleId]) continue;

            var source;
            if (!rData.inherited) {
                source = 'directly assigned to the user';
            } else {
                var roleGroups = AccessUtil.findGroupsHavingRole(rData.roleId) || [];
                var userGroups = [];
                if (roleGroups.length) {
                    var grUG = new GlideRecord('sys_user_grmember');
                    grUG.addQuery('user', uid3);
                    grUG.addQuery('group.name', 'IN', roleGroups.join(','));
                    grUG.query();
                    while (grUG.next()) {
                        var gname = grUG.group.name.toString();
                        if (userGroups.indexOf(gname) === -1) userGroups.push(gname);
                    }
                }

                if (userGroups.length) {
                    source = 'granted from ' + userGroups.join(', ') + ' group';
                } else {
                    var directRoles = [];
                    var grDR = new GlideRecord('sys_user_has_role');
                    grDR.addQuery('user', uid3);
                    grDR.addQuery('inherited', false);
                    grDR.query();
                    while (grDR.next()) {
                        directRoles.push({ roleId: grDR.getValue('role'), roleName: grDR.role.name.toString() });
                    }
                    var viaRole = null;
                    for (var di = 0; di < directRoles.length && !viaRole; di++) {
                        var contained = AccessUtil.findAllContainedRolesForRole(directRoles[di].roleId) || [];
                        if (contained.indexOf(rData.roleName) !== -1) viaRole = directRoles[di].roleName;
                    }
                    source = 'granted from ' + (viaRole || 'role containment');
                }
            }
            externalUsers[uid3].roles[rData.roleId] = { name: rData.roleName, source: source };
        }
    }

    // 8) Findings — batch-load all GlideRecord links before the findings loop to avoid
    //    per-user/role/table/ACL/field individual .get() calls.
    var indent = '&nbsp;&nbsp;&nbsp;&nbsp;';

    // Collect all IDs needed across all finding users
    var allFindingUserIds = [];
    var allRoleIdNames  = {}; // roleId → display name
    var allTableNames   = {}; // tableName → true
    var allAclIds       = {}; // aclId → display label
    var tableFieldNames = {}; // tableName → [fieldElements]

    for (var uid4 in usersWithAccess) {
        var data = externalUsers[uid4];
        if (!Object.keys(data.access.tables).length && !Object.keys(data.access.fields).length) continue;
        allFindingUserIds.push(uid4);
        for (var rid in data.roles) allRoleIdNames[rid] = data.roles[rid].name;
        for (var tname in data.access.tables) {
            allTableNames[tname] = true;
            for (var k = 0; k < data.access.tables[tname].length; k++) {
                var aid = data.access.tables[tname][k];
                var ad = tblAclDataById[aid] || globalAclDataById[aid];
                if (ad) allAclIds[aid] = ad.display;
            }
        }
        for (var fName in data.access.fields) {
            var fp = fName.split('.');
            if (fp.length === 2) {
                if (!tableFieldNames[fp[0]]) tableFieldNames[fp[0]] = [];
                if (tableFieldNames[fp[0]].indexOf(fp[1]) === -1) tableFieldNames[fp[0]].push(fp[1]);
            }
            for (var m = 0; m < data.access.fields[fName].length; m++) {
                var aid2 = data.access.fields[fName][m];
                var ad2 = colAclDataById[aid2] || globalAclDataById[aid2];
                if (ad2) allAclIds[aid2] = ad2.display;
            }
        }
    }

    if (allFindingUserIds.length === 0) return;

    // Batch-load role links
    var roleLinkMap = {}; // roleId → link string
    var allRoleIdKeys = Object.keys(allRoleIdNames);
    if (allRoleIdKeys.length > 0) {
        var bRole = new GlideRecord('sys_user_role');
        bRole.addQuery('sys_id', 'IN', allRoleIdKeys.join(','));
        bRole.query();
        while (bRole.next()) {
            var bRoleId = bRole.getUniqueValue();
            roleLinkMap[bRoleId] = AccessUtil.getRecordLink(bRole, allRoleIdNames[bRoleId]);
        }
    }

    // Batch-load table links
    var tableLinkMap = {}; // tableName → link string
    var allTableNameKeys = Object.keys(allTableNames);
    if (allTableNameKeys.length > 0) {
        var bTable = new GlideRecord('sys_db_object');
        bTable.addQuery('name', 'IN', allTableNameKeys.join(','));
        bTable.query();
        while (bTable.next()) {
            var bTName = '' + bTable.name;
            tableLinkMap[bTName] = AccessUtil.getRecordLink(bTable, bTName);
        }
    }

    // Batch-load ACL links
    var aclLinkMap = {}; // aclId → link string
    var allAclIdKeys = Object.keys(allAclIds);
    if (allAclIdKeys.length > 0) {
        var bAcl = new GlideRecord('sys_security_acl');
        bAcl.addQuery('sys_id', 'IN', allAclIdKeys.join(','));
        bAcl.query();
        while (bAcl.next()) {
            var bAclId = bAcl.getUniqueValue();
            aclLinkMap[bAclId] = AccessUtil.getRecordLink(bAcl, allAclIds[bAclId]);
        }
    }

    // Batch-load dictionary field links (grouped by table to avoid OR-explosion)
    var fieldLinkMap = {}; // fullName → link string
    for (var dictTable in tableFieldNames) {
        var bDict = new GlideRecord('sys_dictionary');
        bDict.addQuery('name', dictTable);
        bDict.addQuery('element', 'IN', tableFieldNames[dictTable].join(','));
        bDict.query();
        while (bDict.next()) {
            var fullName = bDict.getValue('name') + '.' + bDict.getValue('element');
            fieldLinkMap[fullName] = AccessUtil.getRecordLink(bDict, fullName);
        }
    }

    // Emit findings using a single batch query for users (for setCurrentSource + userLink)
    var bUser = new GlideRecord('sys_user');
    bUser.addQuery('sys_id', 'IN', allFindingUserIds.join(','));
    bUser.query();
    while (bUser.next()) {
        var uid4 = bUser.getUniqueValue();
        var data = externalUsers[uid4];
        if (!Object.keys(data.access.tables).length && !Object.keys(data.access.fields).length) continue;

        var userLink = AccessUtil.getRecordLink(bUser, bUser.getDisplayValue('name'));

        var msg = '';
        msg += 'External users are those assigned the snc_external role, which is typically intended for limited access. ';
        msg += 'User ' + userLink + ' has been flagged because, in addition to the snc_external role, ';
        msg += 'they hold additional roles that grant access to classified data.\n\n';

        // Roles
        msg += 'Roles:\n';
        var idx = 1;
        for (var roleId in data.roles) {
            var r = data.roles[roleId];
            var roleDisplay = roleLinkMap[roleId] || r.name;
            msg += (idx++) + '. ' + roleDisplay + ' is ' + r.source + '\n';
        }

        // Tables
        msg += '\nTables:\n';
        idx = 1;
        for (var tname in data.access.tables) {
            var tableDisplay = tableLinkMap[tname] || tname;
            msg += (idx++) + '. ' + tableDisplay + '\n';
            for (var k = 0; k < data.access.tables[tname].length; k++) {
                var aclId = data.access.tables[tname][k];
                var aclData = tblAclDataById[aclId] || globalAclDataById[aclId];
                if (!aclData) continue;
                var letter = String.fromCharCode(97 + k);
                msg += indent + letter + '. ' + (aclLinkMap[aclId] || aclData.display) + '\n';
            }
        }

        // Fields
        msg += '\nFields:\n';
        idx = 1;
        for (var fullName in data.access.fields) {
            var fDisplay = fieldLinkMap[fullName] || fullName;
            msg += (idx++) + '. ' + fDisplay + '\n';
            for (var m = 0; m < data.access.fields[fullName].length; m++) {
                var aclId2 = data.access.fields[fullName][m];
                var aclData2 = colAclDataById[aclId2] || globalAclDataById[aclId2];
                if (!aclData2) continue;
                var letter2 = String.fromCharCode(97 + m);
                msg += indent + letter2 + '. ' + (aclLinkMap[aclId2] || aclData2.display) + '\n';
            }
        }

        finding.setCurrentSource(bUser);
        finding.setValue('finding_details', msg);
        finding.increment();
    }
    // set maps to null to free up memory
    roleLinkMap = null;
    tableLinkMap = null;
    fieldLinkMap = null;
    aclLinkMap = null;
    aclRolesById = null;
    colAclIdsByFull = null;
    colAclDataById = null;
    tblAclIdsByTable = null;
    tblAclDataById = null;
    globalAclIdsByTable = null;
    globalAclDataById = null;
})(finding, current);
