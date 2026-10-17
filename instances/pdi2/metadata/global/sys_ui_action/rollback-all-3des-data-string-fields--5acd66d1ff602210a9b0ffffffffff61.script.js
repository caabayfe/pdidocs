function confirmRollbackNonPassword2All() {
    var dialog = new GlideModal('glide_confirm_standard');
    dialog.setTitle(new GwtMessage().getMessage('Confirm Rollback'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', new GwtMessage().getMessage("Rollback All 3DES Data String Fields action will reencrypt all previously migrated data back to legacy encryption format. Are you sure you want to continue?"));
    dialog.setPreference('defaultButton', 'cancel_button');
    dialog.setPreference('onPromptComplete', onPromptComplete);
    dialog.setWidth(400);
    dialog.setPreference("focusTrap", true);
    dialog.render();
}

function onPromptComplete() {
    g_list.action('5acd66d1ff602210a9b0ffffffffff61', 'sysverb_rollback_non_password2_all');
}
if(typeof window == 'undefined'){
    runMigration();
}
function runMigration() {
	var jobName = 'Rollback All 3DES Data String Fields encryption format for legacy migrated fields';
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
		gs.addErrorMessage(gs.getMessage("A 3DES Data String Fields rollback job already exists, please check the job status {0}.", jobLink));
	} else {
		job.name = jobName;
		job.type = jobType;
		var gdt = new GlideDateTime();
		var gtStart = new GlideTime();
		var gtEnd = new GlideTime(gdt.getNumericValue() + 43200000);//12 hours from now
		job.window_start = gtStart;
		job.window_end = gtEnd;
		job.insert();
		//start job
		new SNC.MassEncryptionJob().start(job);
		//add an info message with a link to the job
		jobLink = "<a href='" + job.getLink() + "'>here</a>";
		gs.addInfoMessage(gs.getMessage("Added a 3DES Data String Fields rollback job, please check the job status {0}.", jobLink));
	}
}
