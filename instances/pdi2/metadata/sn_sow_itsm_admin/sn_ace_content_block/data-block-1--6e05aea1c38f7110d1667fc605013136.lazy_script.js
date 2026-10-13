(function(context, pageParams, blockcontext) {
    var sysUserGR = new GlideRecord("sys_user");
    sysUserGR.orderBy("name");
    sysUserGR.query();
    var recipientsList = [];
    while (sysUserGR.next()) {
        var user = {};
        user.id = sysUserGR.getUniqueValue();
        user.label = sysUserGR.getValue("name");
        user.sublabel = sysUserGR.getValue("email") || "";
        user.table = "sys_user";
        user.avatarProps = {
            "userName": user.label,
            "imageSrc": "sn_sow_itsm_admin.circle-user-outline.png"
        };
        recipientsList.push(user);
    }

    // sys_user_group
    var sysUserGroupGR = new GlideRecord("sys_user_group");
    sysUserGroupGR.orderBy("name");
    sysUserGroupGR.query();
    while (sysUserGroupGR.next()) {
        var userGroup = {};
        userGroup.id = sysUserGroupGR.getUniqueValue();
        userGroup.label = sysUserGroupGR.getValue("name");
        userGroup.sublabel = sysUserGroupGR.getValue("description") || "";
        userGroup.table = "sys_user_group";
        userGroup.avatarProps = {
            "userName": userGroup.label,
            "imageSrc": "sn_sow_itsm_admin.user-group-outline.png"
        };
        recipientsList.push(userGroup);
    }

    // sn_publications_recipients_list
    var snPublicationsRecipientsListGR = new GlideRecord("sn_publications_recipients_list");
    snPublicationsRecipientsListGR.orderBy("name");
    snPublicationsRecipientsListGR.query();
    while (snPublicationsRecipientsListGR.next()) {
        var snPublicationsRecipientList = {};
        snPublicationsRecipientList.id = snPublicationsRecipientsListGR.getUniqueValue();
        snPublicationsRecipientList.label = snPublicationsRecipientsListGR.getValue("name");
        snPublicationsRecipientList.table = "recipients_list";
        snPublicationsRecipientList.avatarProps = {
            "userName": snPublicationsRecipientList.label,
            "imageSrc": "sn_sow_itsm_admin.user-group-outline.png"
        };
        recipientsList.push(snPublicationsRecipientList);
    }

    return {
        recipientsList: recipientsList,
    };
})(context, pageParams, blockcontext);
