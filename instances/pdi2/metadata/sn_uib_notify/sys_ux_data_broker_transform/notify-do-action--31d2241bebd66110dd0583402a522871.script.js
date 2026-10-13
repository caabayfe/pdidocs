function transform(input) {
    var actionDetails = input.actionDetails;
    if (!actionDetails || !actionDetails.provider){
        return {};
    }
    var confUtils = new global.NotifyConferenceUtils();
    var templateData = confUtils.getConferenceInputDataTemplate();
    templateData.confId = actionDetails.confId;
    templateData.service_provider = actionDetails.provider;
    var items = [];
    for (var i = 0; i < actionDetails.users.length; i++){
        items.push({
            notifyParticipantId:actionDetails.users[i]
        });
    }
    templateData.items = items;
    var result = {};
    result = confUtils.doConferenceAction(actionDetails.action, templateData);
    return result;
}
