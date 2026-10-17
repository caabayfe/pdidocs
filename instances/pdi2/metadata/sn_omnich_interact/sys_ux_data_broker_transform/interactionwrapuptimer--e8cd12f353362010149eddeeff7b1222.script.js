function transform(input) {
    var returnObject = {};

    var interactionSysID = input.interactionSysID;
    var interaction = new GlideRecord('interaction');
    interaction.get(interactionSysID);

    var state = interaction.getValue('state');
    var assignedTo = interaction.getValue('assigned_to');
    // The timer only shows up in state wrap up, when the login user is the assigned user.
    if (state === 'wrap_up' && gs.getUserID() === assignedTo) {

        var util = new global.WrapUpInteractionUtil();
        var isShowWrapUpTimerEnabled = util.isShowWrapUpTimerEnabled(interaction);
        if (!isShowWrapUpTimerEnabled)
            return returnObject;

        var wrapUpDuration = util.getWrapUpDuration(interaction);
        var stateChangedOn = interaction.getValue('state_changed_on');
        var end = new GlideDateTime(stateChangedOn).getNumericValue() + wrapUpDuration * 1000;
        var now = new GlideDateTime().getNumericValue();
        var timeLeftOnMillisecond = end - now;

        if (timeLeftOnMillisecond <= 0)
            return returnObject;

        returnObject["timeLeftOnMillisecond"] = timeLeftOnMillisecond;
        returnObject["wrapUpDuration"] = wrapUpDuration;
    }
    return returnObject;
}
