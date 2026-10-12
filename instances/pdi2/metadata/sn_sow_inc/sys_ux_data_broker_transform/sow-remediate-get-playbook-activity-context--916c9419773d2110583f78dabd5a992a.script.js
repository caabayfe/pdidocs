function transform(input) {
    var output = [];
    var contextId = input.context_id;
    var query = input.query;
    var playbookUtil = new sn_sow_inc.SOWRemedialActionPlaybookUtil();
    var activityGr = playbookUtil.getActivityGrFromPlaybookContext(contextId, query);
    while (activityGr.next()) {
        var obj = {
            'label': activityGr.getDisplayValue('label'),
            'lane': activityGr.getDisplayValue('lane'),
            'sys_created_on': activityGr.getDisplayValue('sys_created_on'),
            'sys_updated_on': activityGr.getDisplayValue('sys_updated_on')
        }
        output.push(obj);
    }
    return output;
}
