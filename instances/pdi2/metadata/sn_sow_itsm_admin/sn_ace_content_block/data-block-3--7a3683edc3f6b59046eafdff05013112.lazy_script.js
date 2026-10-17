(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().activateTriggerRules(blockcontext.selectedRecords);
    return {
        showActivateAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
