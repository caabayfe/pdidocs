(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().deactivateCommunicationTaskDefinitions(blockcontext.selectedRecords);
    return {
        showDeactivateAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
