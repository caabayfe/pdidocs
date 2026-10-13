(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().copyCommunicationTaskDefinition(blockcontext.selectedRecords[0], blockcontext.taskCopyName, blockcontext.channels);
    return {
        showCopyAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
