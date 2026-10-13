(function(context, pageParams, blockcontext) {
    var response = {};
    var updateStatus = false;
    var noOfValidPlaybookIds = 0;
    var noOfInvalidPlaybookIds = 0;
    var noOfAlreadyAssignedPlaybookIds = 0;
    var assignedPlaybookIds = [];
    var playbookIds = [];

    try {
        var validPlaybooksList = blockcontext.validPlaybookIds; //this list contains only playbooks that are active and published
        var selectedPlaybookIdsValue = blockcontext.selectedRecords_assignPlaybookIds;
        var selectedPlaybookIds = selectedPlaybookIdsValue.split(",");
        var playbookSysPropValue = gs.getProperty('sn_sow_mim.playbook_ids');

        if (!gs.nil(playbookSysPropValue)) {
            assignedPlaybookIds = playbookSysPropValue.split(",");
            playbookIds = assignedPlaybookIds;
        }
        
        for (var index = 0; index < selectedPlaybookIds.length; index++) {
            var playbookId = selectedPlaybookIds[index];
            if (validPlaybooksList.indexOf(playbookId) > -1) {
                ++noOfValidPlaybookIds;
                //this check is not to add duplicate id in sys property
                //if playbooks id(s) directly added in sys property 
                if (assignedPlaybookIds.indexOf(playbookId) === -1)
                    playbookIds.push(playbookId);
                else
                    ++noOfAlreadyAssignedPlaybookIds;
            } else
                ++noOfInvalidPlaybookIds;
        }

        if (selectedPlaybookIds.length ==  noOfInvalidPlaybookIds) {
            updateStatus = false;
            gs.warn('No active playbook(s) with published status selected to be assigned to MIM');
        } else {
            var propValue = playbookIds.join();
            updateStatus = new sn_sow_mim.SOWMIMPlaybookUtil().updateProperty("sn_sow_mim.playbook_ids", propValue, false);
        }
    } catch (error) {
        gs.warn('Error while assigning playbook ids to sys property :: ', error);
    }

    response.updateStatus = updateStatus;
    response.noOfValidPlaybookIds = noOfValidPlaybookIds;
    response.noOfInvalidPlaybookIds = noOfInvalidPlaybookIds;
    response.noOfAlreadyAssignedPlaybookIds = noOfAlreadyAssignedPlaybookIds;
    response.noOfSelectedPlaybookIds = selectedPlaybookIds.length;

    return {
        response: response
    };
})(context, pageParams, blockcontext);
