(function(context, pageParams, blockcontext) {
    var hideInboxProp = blockcontext.hideInboxProp;
    var sowITSMCommonAdminCenterUtils = new sn_sow_itsm_common.SOWITSMCommonAdminCenterUtils();
    var response = sowITSMCommonAdminCenterUtils.updateHideInboxProp(hideInboxProp);
    return {
        updateResponse: response
    };
})(context, pageParams, blockcontext);
