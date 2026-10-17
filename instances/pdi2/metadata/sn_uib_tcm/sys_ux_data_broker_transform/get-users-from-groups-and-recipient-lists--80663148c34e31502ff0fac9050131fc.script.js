function transform(input) {
    var result = {};
    if (!input || !input.inputObj || Object.keys(input.inputObj.channelRecipeints).length == 0)
        return result;

    var channelRecipeints = input.inputObj.channelRecipeints;
    var smsChannelRecipeints;
    if (channelRecipeints.hasOwnProperty("sms")) {
        smsChannelRecipeints = channelRecipeints.sms;
        delete channelRecipeints["sms"];
    }

    result = new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getAggregatedMembers(channelRecipeints, input.inputObj.commTaskTable, input.inputObj.commTaskId);

    if (smsChannelRecipeints) {
        result.sms = new sn_uib_tcm.CommunicationManagementUXFBaseUtil().getAggregatedSMSNumbers(input.inputObj.commTaskTable, input.inputObj.commTaskId, smsChannelRecipeints);
    }

    return result;
}
