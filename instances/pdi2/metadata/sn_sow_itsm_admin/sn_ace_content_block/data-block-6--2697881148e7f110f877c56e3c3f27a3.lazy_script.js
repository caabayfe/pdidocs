(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().copyTriggerRule(blockcontext.selectedRecords[0], blockcontext.triggerRuleCopyName);
    return {
        showCopyAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
