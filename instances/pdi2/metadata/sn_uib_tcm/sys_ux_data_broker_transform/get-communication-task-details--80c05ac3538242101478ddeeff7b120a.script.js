function transform(input) {
    var output = {};
    if (!input || !input.table || !input.commTaskSysId)
        output.message = gs.getMessage("Inputs cannot be empty");
    else {
        var respData = {};
        var commManagementUtils = new sn_comm_management.CommunicationManagementUtil();
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(input.table);
        var commTaskGR = new GlideRecord(handlerInstance.getCommTaskInstanceForTask());
        var channels = [];
        if (commTaskGR.get(input.commTaskSysId)) {
            var channelGr = new GlideRecord(commManagementUtils.TABLES.COMM_CHANNEL);
            channelGr.addQuery(commManagementUtils.COLUMNS.COMM_TASK, commTaskGR.getUniqueValue());
            channelGr.query();
            while (channelGr.next())
                channels.push(channelGr.comm_channel_config.type + '');

            var channelMap = commManagementUtils.getChannelMap(input.table, channels);
            for (var channel in channelMap) {
                if (channelMap[channel].classification != 'update')
                    continue;
                if (channelMap[channel].available) {
                    commManagementUtils.prepareDataForCommunication(channelMap[channel], commTaskGR, respData);
                } else {
                    respData[channel] = channelMap[channel];
                }
            }
            output.data = respData;
        } else
            output.message = gs.getMessage("Communication task not found");
    }
    return output;
}
