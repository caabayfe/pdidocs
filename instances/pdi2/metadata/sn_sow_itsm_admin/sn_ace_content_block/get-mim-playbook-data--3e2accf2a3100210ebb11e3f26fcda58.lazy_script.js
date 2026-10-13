(function(context, pageParams, blockcontext) {
    var hideRecommendContent = true;
    var sysPropertyValue = gs.getProperty('sn_sow_mim.playbook_ids');
    var existingPlaybookids = sysPropertyValue.split(',');
    var playbookSysIds = ['3850d391533531108f2bddeeff7b1208', 'a1139dad538802108f2bddeeff7b12d6'];
    playbookSysIds = playbookSysIds.filter(function(id) {
        return existingPlaybookids.indexOf(id) < 0;
    });
    if (playbookSysIds.length == 0)
        hideRecommendContent = false;
    var processDefGR = new GlideRecordSecure('sys_pd_process_definition');
    processDefGR.addQuery('sys_id', "IN", playbookSysIds.join(','));
    processDefGR.query();
    var playbookObjs = [];
    var processPath = '/now/workflow-studio/builder?tableName=sys_pd_process_definition&builderId=process&sysId=';
    while (processDefGR.hasNext()) {
        processDefGR.next();
        var activeStatus = '';
        var type = '';
        if (processDefGR.getValue('active') == '1') {
            activeStatus = gs.getMessage("Active");
            type = 'positive';
        } else {
            activeStatus = gs.getMessage("Inactive");
            type = 'critical';
        }
        var status = processDefGR.getValue('status');
        status = status.charAt(0).toUpperCase() + status.slice(1);
        var disableAssignToMIM = false;
        if (processDefGR.getValue('active') != '1' || processDefGR.getValue('status').toUpperCase() != 'PUBLISHED') {
            disableAssignToMIM = true;
        }
        var playbpookObj = {
            label: processDefGR.getValue('label'),
            status: status,
            updatedOn: processDefGR.getValue('sys_updated_on'),
            viewDetailsUrl: processPath + processDefGR.getValue('sys_id'),
            activeStatus: activeStatus,
            type: type,
            sysId: processDefGR.getValue('sys_id'),
            disableAssignToMIM: disableAssignToMIM
        };
        playbookObjs.push(playbpookObj);
    }
    return {
        playbookObjs: playbookObjs,
        hideRecommendContent: hideRecommendContent
    };
})(context, pageParams, blockcontext);
