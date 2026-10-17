var users = [];
if (!gs.nil(current.email)) {
    getUsers(current.email);
}

function getUsers(email) {
    if (email.type != 'sent')
        return;
    var recipientList = [];
    if (!gs.nil(email.direct)) {
        recipientList = recipientList.concat(email.direct.split(","));
    }
    if (!gs.nil(email.copied)) {
        recipientList = recipientList.concat(email.copied.split(","));
    }
    if (!gs.nil(email.blind_copied)) {
        recipientList = recipientList.concat(email.blind_copied.split(","));
    }
    if (!gs.nil(email.recipients)) {
        recipientList = recipientList.concat(email.recipients.split(","));
    }
    if (recipientList.length > 0) {

        var device = new GlideRecord("cmn_notif_device");
        device.addQuery("email_address", recipientList);
        device.adddQuery("type", "Email");
        device.addActiveQuery();
        device.query();
        while (device.next()) {
            if (device.user && device.user.sys_id) {
                users.push(device.user.sys_id.toString());
            }
        }
    }
}

users;
