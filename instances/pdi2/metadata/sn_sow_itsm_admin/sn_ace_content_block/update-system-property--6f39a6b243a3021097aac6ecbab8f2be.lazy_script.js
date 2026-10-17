(function(context, pageParams, blockcontext) {
    var days = blockcontext.days;
    var sowInteractionAdminCenterUtils = new sn_sow_interaction.SOWInteractionAdminCenterUtils();
    var response = sowInteractionAdminCenterUtils.updateNumberOfDays(days);
    return {
        updateResponse: response
    };
})(context, pageParams, blockcontext);
