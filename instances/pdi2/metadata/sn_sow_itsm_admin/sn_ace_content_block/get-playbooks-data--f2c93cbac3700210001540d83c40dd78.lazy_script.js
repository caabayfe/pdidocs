(function(context, pageParams, blockcontext) {
    // return some_output
    var availablePlaybookIds = [];
    var assignedPlaybookIds = [];
    /**
     * All playbooks in the system will be displayed under Available Playbooks
     * Only playbooks with Active and Published status can be assigned to MIM
     */
    var validPlaybookIds = [];

    var playbookSysPropertyValue = gs.getProperty('sn_sow_mim.playbook_ids');
    
    if (!gs.nil(playbookSysPropertyValue)) {
        assignedPlaybookIds = playbookSysPropertyValue.split(',');
    }

    var gr = new GlideRecordSecure('sys_pd_process_definition');
    gr.query();

    while (gr.next()) {
        var playbookId = gr.getValue('sys_id');

        if ((gr.getValue('active') === '1') && (gr.getValue('status') === "published"))
            validPlaybookIds.push(playbookId);

        if (assignedPlaybookIds.indexOf(playbookId) === -1)
            availablePlaybookIds.push(playbookId);
    }
    
    if (assignedPlaybookIds.length === 0) {
        return {
            showNoSearchResults: true,
            showAssignedPlaybooks: false,
            availablePlaybookIds: "sys_idIN" + availablePlaybookIds,
            validPlaybookIds: validPlaybookIds
        };
    } else {
        return {
            showNoSearchResults: false,
            showAssignedPlaybooks: true,
            assignedPlaybookIds: "sys_idIN" + assignedPlaybookIds,
            availablePlaybookIds: "sys_idIN" + availablePlaybookIds,
            validPlaybookIds: validPlaybookIds
        };
    }

})(context, pageParams, blockcontext);
