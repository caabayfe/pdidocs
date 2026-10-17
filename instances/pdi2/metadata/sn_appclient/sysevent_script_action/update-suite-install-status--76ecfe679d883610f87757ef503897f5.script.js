gs.info(`Update suite install state script triggered by event: ${event.name}, parm1: ${event.parm1}`);
try {
	var params = JSON.parse(String(event.parm1));
	var batchInstallStatus = params.status;
	var batchInstallPlanName = params.batch_plan_name;
	var suiteConfigSysId = getSuiteConfigSysId(params.batch_plan_id);
	if (suiteConfigSysId) {
		if (batchInstallStatus === 'installed' || batchInstallStatus === 'partial_install') {
			gs.info(`Updating suite install status based on event ${JSON.stringify(event.parm1)}`);
			var grReset = new GlideRecord('sys_suite_config');
			grReset.addQuery('installed', true);
			grReset.query();
			while (grReset.next()) {
				grReset.installed = false;
				grReset.update();
			}
			var gr = new GlideRecord('sys_suite_config');
			if (gr.get(suiteConfigSysId)) {
				gr.installed = true;
				gr.update();
			} else {
				gs.error(`Suite config not found for ${JSON.stringify(event.parm1)}`);
			}
		} else {
			gs.error(`Batch install failed for golden config: ${JSON.stringify(event.parm1)}`);
		}
	}
} catch(e) {
	gs.error(`Failed to run update suite install state script for event ${JSON.stringify(event)}`);
}

function getSuiteConfigSysId(batchPlanId) {
	if (!batchPlanId) {
		gs.error('Missing batch_plan_id in event parameters.');
		return;
	}
	var plan = new GlideRecord('sys_batch_install_plan');
	if (plan.get(batchPlanId)) {
		var notes = String(plan.notes || '');
		if (notes.indexOf('gc_id:') > -1) {
			return notes.split('gc_id:')[1];
		}
		gs.error(`No gc_id found in notes for plan ${batchPlanId}`);
	} else {
		gs.error(`sys_batch_install_plan not found for ID: ${batchPlanId}`);
	}
	return;
}
