(function(context, pageParams, blockcontext) {
    var selectedChannels = blockcontext.selectedChannelInfo.channels;
    selectedChannels.forEach(function(selectedChannel) {
        var channelDefTable = selectedChannel["def_table"];
        var commChannelDefGR = new GlideRecord(channelDefTable);
        commChannelDefGR.initialize();
        commChannelDefGR.setValue("comm_task_definition", blockcontext.taskSysId);
        commChannelDefGR.setValue("channel", selectedChannel.id);
        if (selectedChannel.id == "1513471e870013000e3dd61e36cb0bf2") { //e-mail
            commChannelDefGR.setValue("email_client_template", blockcontext.selectedChannelInfo.emailTemplate);
        }
        commChannelDefGR.insert();
    });
    return {
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        showTaskCreatedAlert: !blockcontext.isTaskUpdate,
        showTaskUpdatedAlert: blockcontext.isTaskUpdate,
        taskChannelsModified: false
    };
})(context, pageParams, blockcontext);
