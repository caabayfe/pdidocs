(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().deleteCommunicationTaskDefinitions(blockcontext.selectedRecords);
    return {
        showDeleteAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
