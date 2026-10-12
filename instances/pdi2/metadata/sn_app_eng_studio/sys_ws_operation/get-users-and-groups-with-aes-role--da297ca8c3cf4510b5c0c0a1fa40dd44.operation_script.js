function getObjectsFromRecords(records, valueFieldsToRetrieve, displayFieldsToRetrieve, type) {
    var aesUtils = new AesUtils();
    var output = [];

    while (records.next()) {
        var obj = aesUtils.getObjectFromGlideRecord(records, valueFieldsToRetrieve, displayFieldsToRetrieve);

        obj.type = type;

        output.push(obj);
    }

    return output;
}

function getUsersWithAESRole(nameFilter, limit) {
    var type = 'user';
    var valueFieldsToRetrieve = ['sys_id', 'email'];
    var displayFieldsToRetrieve = ['name', 'avatar'];

    var results = [];

    var records = new GlideRecord('sys_user');
    var userRoleJoin = records.addJoinQuery('sys_user_has_role');

    records.addActiveQuery();

    userRoleJoin.addCondition('role', CreatorStudioConstants.roles.AES_USER_ROLE_ID);

    records.addQuery('name', "CONTAINS", nameFilter);

    if (limit) {
        records.setLimit(limit);
    }

    records.orderBy('name');

    records.query();

    return getObjectsFromRecords(records, valueFieldsToRetrieve, displayFieldsToRetrieve, type);
}

function getGroupsWithAESRole(nameFilter, limit) {
    var type = 'group';
    var valueFieldsToRetrieve = ['sys_id', 'email'];
    var displayFieldsToRetrieve = ['name'];

    var results = [];

    var records = new GlideRecord('sys_user_group');
    var groupRoleJoin = records.addJoinQuery('sys_group_has_role', 'sys_id', 'group');

    records.addActiveQuery();

    groupRoleJoin.addCondition('role', CreatorStudioConstants.roles.AES_USER_ROLE_ID);

    records.addQuery('name', "CONTAINS", nameFilter);

    if (limit) {
        records.setLimit(limit);
    }

    records.orderBy('name');

    records.query();

    return getObjectsFromRecords(records, valueFieldsToRetrieve, displayFieldsToRetrieve, type);
}


function process(request, response) {
    try {
        var nameFilter = request.queryParams.name_filter ? request.queryParams.name_filter[0] : '';
        var limit = request.queryParams.limit_per_type ?
            request.queryParams.limit_per_type[0] :
            request.queryParams.limit_per_type;

        var usersWithAesRole = getUsersWithAESRole(nameFilter, limit);
        var groupsWithAESRole = getGroupsWithAESRole(nameFilter, limit);
        var usersAndGroups = usersWithAesRole.concat(groupsWithAESRole);

        usersAndGroups.sort(function(a, b) {
            if (a.name === b.name) {
                return 0;
            }

            if (!a.name)
                return 1;

            if (!b.name)
                return -1;

            return a.name < b.name ? -1 : 1;
        });
        var result = {
            usersAndGroups: usersAndGroups,
            userCount: usersWithAesRole.length,
            groupCount: groupsWithAESRole.length
        };

        response.setBody(result);
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
}

process(request, response);
