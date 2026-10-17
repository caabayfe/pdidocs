(function(context, pageParams, blockcontext) {
    var sysPropertyValue = gs.getProperty('sn_sow_mim.playbook_ids');
    var sysIds = sysPropertyValue.split(',');
    var updateStatus = false;
    if (sysIds.indexOf(blockcontext.mimPlaybookSysId) != -1) {
        updateStatus = true;
    } else {
        try {
            var propValue = "";
            if (gs.nil(sysPropertyValue))
                propValue = blockcontext.mimPlaybookSysId;
            else
                propValue = sysPropertyValue + "," + blockcontext.mimPlaybookSysId;
            updateStatus = new sn_sow_mim.SOWMIMPlaybookUtil().updateProperty("sn_sow_mim.playbook_ids",propValue,false);
        } catch (ex) {
            updateStatus = false;
        }
    }
    return {
        updateStatus: updateStatus
    };
})(context, pageParams, blockcontext);
