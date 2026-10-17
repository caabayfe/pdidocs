(function(context, pageParams, blockcontext) {
    var closeInteractionProp = blockcontext.closeInteractionProp;
    var sowIncidentAdminCenterUtils = new sn_sow_inc.SOWIncidentAdminCenterUtils();
    var response = sowIncidentAdminCenterUtils.updateCloseInteractionProp(closeInteractionProp);
    return {
        updateResponse: response
    };
})(context, pageParams, blockcontext);
