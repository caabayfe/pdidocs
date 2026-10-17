function transform(input) {
    var result = [];
	var response = {};
    var rdt = new GlideRecord('reconcile_duplicate_template_run');
	if(input.librarySysId) {
		rdt.addQuery('template.library', input.librarySysId);
	}
	rdt.addEncodedQuery('stateINdraft,ready,running');
    rdt.query();

    while (rdt.next()) {
        var templateDetail = {};
        templateDetail['template_name'] = rdt.template.name.toString() + " (" +rdt.getValue("run_id") + ")";
        templateDetail['template_class'] = getTableLabel(rdt.template.table.getDisplayValue());
        templateDetail['template_run_sys_id'] = rdt.sys_id.toString();
		templateDetail['template_run_start_time'] = rdt.getDisplayValue('started');
        templateDetail['template_task_count'] = getTaskDetails(rdt.sys_id);
		templateDetail['template_task_run_state'] = rdt.getValue('state');
		templateDetail['template_task_errors'] = rdt.getValue('errors');
		templateDetail['template_task_skipped'] = rdt.getValue('skipped');
		templateDetail['template_task_processed'] = rdt.getValue('processed');
		
        result.push(templateDetail);
    }

    function getTaskDetails(templateRun) {
        var res = {};
        var rdtr = new GlideAggregate('reconcile_duplicate_template_task_run');
        rdtr.addQuery('run', templateRun);
        rdtr.addAggregate('COUNT', 'state');
        rdtr.orderBy('state');
        rdtr.query();
        var total = 0;
        var nonComplete = 0;
        while (rdtr.next()) {
            var stateCount = rdtr.getAggregate('COUNT', 'state');
            var state = rdtr.getValue('state');
            if (state == 'ready' || state == 'running') {
                nonComplete = parseInt(nonComplete) + parseInt(stateCount);
            }
            total = parseInt(total) + parseInt(stateCount);
        }
        res['total'] = total;
        res['complete'] = parseInt(total) - parseInt(nonComplete);
        return res;
    }

    function getTableLabel(table) {
        var dbo = new GlideRecord('sys_db_object');
        dbo.addQuery('name', table);
        dbo.query();
        if (dbo.next()) {
            return dbo.getValue('label');
        }
        return null;
    }

	result.sort(function(temp1, temp2) {
        if(temp1.template_task_count.total >= temp2.template_task_count.total) {
			return -1;
		} else {
			return 1;
		}
	});
	response.templateDetails = result;
	response.lastUpdatedInfoText = gs.getMessage("Last updated: {0}", new GlideDateTime().getDisplayValue());
    return response;
}
