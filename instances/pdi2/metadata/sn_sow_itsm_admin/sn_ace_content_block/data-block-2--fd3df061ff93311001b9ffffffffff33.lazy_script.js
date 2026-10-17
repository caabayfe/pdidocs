(function(context, pageParams, blockcontext) {
    new sn_sow_itsm_admin.SOWAdminCenterMIUtils().copyCommunicationPlanDefinition(blockcontext.selectedRecords[0], blockcontext.planCopyName, blockcontext.copyTasksChecked, blockcontext.channels);
    return {
        showCopyAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
