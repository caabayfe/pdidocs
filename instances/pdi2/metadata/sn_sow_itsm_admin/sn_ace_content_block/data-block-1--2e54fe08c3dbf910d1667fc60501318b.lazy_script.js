(function(context, pageParams, blockcontext) {
    var taskDefGR = new GlideAggregate('comm_task_definition');
    taskDefGR.addQuery("comm_plan_definition", pageParams.planSysId);
    taskDefGR.addAggregate('COUNT');
    taskDefGR.query();
    var count = 0;
    if (taskDefGR.next()) {
        count = taskDefGR.getAggregate('COUNT');
    }
    var commPlanDefTable = "",
        commPlanDefName = "";
    var commPlanDefGR = new GlideRecord("comm_plan_definition");
    if (commPlanDefGR.get("sys_id", pageParams.planSysId)) {
        commPlanDefTable = commPlanDefGR.getValue("table");
        commPlanDefName = commPlanDefGR.getValue("name");
    }
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
    var snPublicationsRecipientsListGR = new GlideRecord(
        "sn_publications_recipients_list"
    );
    snPublicationsRecipientsListGR.orderBy("name");
    snPublicationsRecipientsListGR.query();
    while (snPublicationsRecipientsListGR.next()) {
        var snPublicationsRecipientList = {};
        snPublicationsRecipientList.id =
            snPublicationsRecipientsListGR.getUniqueValue();
        snPublicationsRecipientList.label =
            snPublicationsRecipientsListGR.getValue("name");
        snPublicationsRecipientList.table = "recipients_list";
        snPublicationsRecipientList.avatarProps = {
            "userName": snPublicationsRecipientList.label,
            "imageSrc": "sn_sow_itsm_admin.user-group-outline.png"
        };
        recipientsList.push(snPublicationsRecipientList);
    }

    var recipientsGR = new GlideRecord("comm_contact_definition");
    recipientsGR.addQuery("comm_plan_definition", pageParams.planSysId);
    recipientsGR.query();
    var selectedRecipientsList = [];
    while (recipientsGR.next()) {
        selectedRecipientsList.push({
            id: recipientsGR.getValue(recipientsGR.getValue("type")),
            table: recipientsGR.getValue("type"),
            label: recipientsGR.getDisplayValue(recipientsGR.getValue("type")),
            avatarProps: {
                "userName": recipientsGR.label,
                "imageSrc": recipientsGR.getValue("type") === "sys_user" ? "sn_sow_itsm_admin.circle-user-outline.png" : "sn_sow_itsm_admin.user-group-outline.png"
            }
        });
    }
    var channelMap = new sn_comm_management.CommunicationManagementUtil().getChannelMap(commPlanDefTable);
    channelMap = Object.keys(channelMap).reduce(function(r, e) {
        if (channelMap[e].available) r[e] = channelMap[e];
        return r;
    }, {});
    var channelConfig = new GlideRecord("comm_channel_config");
    channelConfig.query();
    var channels = [];
    while (channelConfig.next()) {
        var type = channelConfig.getValue("type");
        var channel = channelMap[type];
        if (!gs.nil(channel)) {
            channel.id = channelConfig.getUniqueValue();
            channels.push(channel);
        }
    }

    var emailTemplateGR = new GlideRecord("sys_email_client_template");
    emailTemplateGR.addQuery(
        "table",
        new sn_comm_management.CommunicationManagementBridgeSNC()
        .getHandlerInstance(commPlanDefTable)
        .getCommTaskInstanceForTask()
    );
    emailTemplateGR.orderBy("order");
    emailTemplateGR.query();
    var emailTemplates = [];
    while (emailTemplateGR.next()) {
        emailTemplates.push({
            id: emailTemplateGR.getUniqueValue(),
            label: emailTemplateGR.getDisplayValue("name"),
        });
    }
    return {
        listRecordCount: count,
        showEmptyState: !(count > 0),
        showList: count > 0,
        channels: channels,
        emailTemplates: emailTemplates,
        recipientsList: recipientsList,
        selectedRecipientsList: selectedRecipientsList,
        storedRecipientsList: selectedRecipientsList,
        planName: commPlanDefName
    };
})(context, pageParams, blockcontext);
