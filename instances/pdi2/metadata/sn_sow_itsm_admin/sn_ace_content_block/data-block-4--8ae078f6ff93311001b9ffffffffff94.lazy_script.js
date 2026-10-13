(function(context, pageParams, blockcontext) {
    new sn_major_inc_mgmt.SOWAdminCenterMIUtils().deleteCommunicationPlanDefinitions(blockcontext.selectedRecords);
    return {
        showDeleteAlert: true,
        refreshList: JSON.stringify({
            "timestamp": new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
