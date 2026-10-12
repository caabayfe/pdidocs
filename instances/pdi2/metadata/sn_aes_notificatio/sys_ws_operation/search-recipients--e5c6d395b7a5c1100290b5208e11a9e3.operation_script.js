function getRecipients(tableName, nameFilter, userType) {
    const recipientsGr = new GlideRecordSecure(tableName);
    const results = [];

    recipientsGr.addActiveQuery();
    recipientsGr.addQuery("name", "CONTAINS", nameFilter);
    recipientsGr.query();

    while (recipientsGr.next()) {
        const recordSysId = recipientsGr.getValue('sys_id');
        const recordName = recipientsGr.getDisplayValue('name');
        const recordEmail = recipientsGr.getDisplayValue('email');
        const recordAvatar = recipientsGr.getDisplayValue('avatar');

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

function getPeople(nameFilter) {
    return getRecipients('sys_user', nameFilter, 'user');
}

function getGroups(nameFilter) {
    return getRecipients('sys_user_group', nameFilter, 'group');
}

function getRecipientsWithFilter(nameFilter){
    const people = getPeople(nameFilter);
    const groups = getGroups(nameFilter);
    const recipients = people.concat(groups);
    
    return recipients;
}

function process(request, response) {
    try {
        const nameFilter = request.queryParams.name_filter ? request.queryParams.name_filter[0] : '';
        const recipients = getRecipientsWithFilter(nameFilter);

        response.setBody(recipients);
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
}

process(request, response);
