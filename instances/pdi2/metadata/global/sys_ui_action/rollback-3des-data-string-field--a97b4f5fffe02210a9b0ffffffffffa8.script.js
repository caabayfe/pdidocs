function confirmRollback() {
    var dialog = new GlideModal('glide_confirm_standard');
    dialog.setTitle(new GwtMessage().getMessage('Confirm Rollback'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', new GwtMessage().getMessage("Rollback 3DES Data String field action will reencrypt all previously migrated  values of the field back to legacy encryption format. Are you sure you want to continue?"));
    dialog.setPreference('defaultButton', 'cancel_button');
    dialog.setPreference('onPromptComplete', onPromptComplete);
    dialog.setWidth(400);
    dialog.setPreference("focusTrap", true);
    dialog.render();
}

function onPromptComplete() {
    gsftSubmit(null, g_form.getFormElement(), 'sysverb_rollback_field_non_password2');
}
if(typeof window == 'undefined'){
    runRollback();
}
//create a job
function runRollback() {
	var jobName = "Rollback 3DES Data String field encryption format of " + current.table + ":" + current.field.element;
	var jobType = 'nonpassword2_data_migration_rollback';
	var jobLink;
	var job = new GlideRecord("sys_mass_encryption_job");
	job.addQuery('name', jobName);
	job.addQuery('type', jobType);
	job.addEncodedQuery("stateNOT INdone,cancelling,cancelled,error");
	job.query();
	if (job.getRowCount() > 0) {
		job.next();
		jobLink = "<a href='" + job.getLink() + "'>here</a>";
		gs.addErrorMessage(gs.getMessage("A 3DES Data String field rollback job already exists, please check the job status {0}.", jobLink));
	} else {
		job.name = jobName;
		job.type = jobType;
		job.table = current.table + "," + current.table;
		job.state = "new";
		var gdt = new GlideDateTime();
		var gtStart = new GlideTime();
		var gtEnd = new GlideTime(gdt.getNumericValue() + 172800000);
		job.window_start = gtStart
		job.window_end = gtEnd;
		job.insert();
		new SNC.MassEncryptionJob().start(job);
		jobLink = "<a href='" + job.getLink() + "'>here</a>";
		gs.addInfoMessage(gs.getMessage("Added a 3DES Data String field rollback job, please check the job status {0}.", jobLink));
		gs.setRedirect(current.getLink());
	}
}
