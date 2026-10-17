function getRecipients(tableName, sysIds, type) {
    if (!sysIds)
        return [];

    const ids = sysIds.split(',');
    const recipientsGr = new GlideRecordSecure(tableName);
    const recipientsObject = {};
    const result = [];

    recipientsGr.addActiveQuery();
    recipientsGr.addQuery('sys_id', 'IN', ids);
    recipientsGr.query();

    while (recipientsGr.next()) {
        const id = recipientsGr.getValue('sys_id');
        const name = recipientsGr.getDisplayValue('name');
        const email = recipientsGr.getDisplayValue('email');
        const avatar = recipientsGr.getDisplayValue('avatar');

        recipientsObject[id] = {
            id: id,
            name: name,
            email: email,
            avatar: avatar,
            type: type,
        };
    }

    ids.forEach(function(sysId) {
        if (recipientsObject[sysId])
            result.push(recipientsObject[sysId]);
    });

    return result;
}

function getPeople(people) {
    return getRecipients('sys_user', people, 'user');
}

function getGroups(groups) {
    return getRecipients('sys_user_group', groups, 'group');
}

function getRecipientsFromNotification(notificationId) {
    const notificationGr = new GlideRecordSecure('sysevent_email_action');
    let recipients = [];

    if (notificationGr.get(notificationId)) {
        const people = getPeople(notificationGr.getValue('recipient_users'));
        const groups = getGroups(notificationGr.getValue('recipient_groups'));
        recipients = people.concat(groups);
    }

    return recipients;
}

function process(request, response) {
    try {
        const notificationId = request.pathParams?.notificationSysId || '';

        if (!notificationId)
            response.setBody([]);
        else
            response.setBody(getRecipientsFromNotification(notificationId));

        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
}

process(request, response);
