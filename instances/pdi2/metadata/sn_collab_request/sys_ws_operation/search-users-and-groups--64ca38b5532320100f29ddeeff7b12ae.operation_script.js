function getRecords(tableName, nameFilter, userType) {
    var results = [];
    var records = new GlideRecord(tableName);

    records.addActiveQuery();
    records.addQuery("name", "CONTAINS", nameFilter);
    records.query();

    while (records.next()) {
        var recordSysId = records.getValue('sys_id');
        var recordName = records.getDisplayValue('name');
        var recordEmail = records.getDisplayValue('email');
        var recordAvatar = records.getDisplayValue('avatar');

        results.push({
            id: recordSysId,
            name: recordName,
            email: recordEmail,
            avatar: recordAvatar,
            type: userType
        });

    }
    return results;
}

function getUsers(nameFilter) {
    return getRecords('sys_user', nameFilter, 'user');
}

function getGroups(nameFilter) {
    return getRecords('sys_user_group', nameFilter, 'group');
}

function process(request, response) {
    try {
        var nameFilter = request.queryParams.name_filter ? request.queryParams.name_filter[0] : '';
        var users = getUsers(nameFilter);
        var groups = getGroups(nameFilter);
        var usersAndGroups = users.concat(groups);

        response.setBody(usersAndGroups);
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
}

process(request, response);
