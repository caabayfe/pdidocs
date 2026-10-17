function redirectToScheduledJob() {
	var id = '0c98a05b0fd233006e5140c1df767e19';
	var job = new GlideRecord('sysauto');

	job.addQuery('sys_id', id);
	job.query();
	if (job.next())
		window.location = 'sysauto_script.do?sys_id=' + id;		
	else
		new GlideForm().addErrorMessage(new GwtMessage().getMessage('The default full scan scheduled job was not found'));
}
