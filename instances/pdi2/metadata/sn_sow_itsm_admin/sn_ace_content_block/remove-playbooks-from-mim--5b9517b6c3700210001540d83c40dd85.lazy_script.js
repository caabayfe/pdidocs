(function(context, pageParams, blockcontext) {
    var updateStatus = false;
    var assignedIds = [];
    var propValue = '';

    try {
        var selectedPlaybookIdsValue = blockcontext.selectedRecords_removePlaybookIds;
        var playbookIds = selectedPlaybookIdsValue.split(',');
        var playbookSysPropValue = gs.getProperty('sn_sow_mim.playbook_ids');

        if (!gs.nil(playbookSysPropValue))
            assignedIds = playbookSysPropValue.split(',');


        if (assignedIds.length > 0) {
            for (var i = 0; i < playbookIds.length; ++i) {
                var playbookId = playbookIds[i];
                var index = assignedIds.indexOf(playbookId);
                if (index > -1)
                    assignedIds.splice(index, 1);
            }
            if (assignedIds && assignedIds.length > 0)
                propValue = assignedIds.join();
        }
        updateStatus = new sn_sow_mim.SOWMIMPlaybookUtil().updateProperty("sn_sow_mim.playbook_ids", propValue, false);
    } catch (error) {
        gs.warn('Error while removing playbook ids from sys property :: ' + error);
    }

    return {
        updateStatus: updateStatus
    };
})(context, pageParams, blockcontext);
