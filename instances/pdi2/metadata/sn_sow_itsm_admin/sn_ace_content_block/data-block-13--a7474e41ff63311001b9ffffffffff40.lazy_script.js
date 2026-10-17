(function(context, pageParams, blockcontext) {
    var commChannelDefGR = new GlideRecord("comm_channel_def_email");
    commChannelDefGR.addQuery("comm_task_definition", blockcontext.taskSysId);
    commChannelDefGR.query();
    if (commChannelDefGR.next()) {
        commChannelDefGR.setValue("email_client_template", blockcontext.selectedChannelInfo.emailTemplate);
        commChannelDefGR.update();
    }
    return {
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        showTaskUpdatedAlert: blockcontext.isTaskUpdate,
        emailTemplateModified: false
    };
})(context, pageParams, blockcontext);
