var archiveLog = new GlideRecord('sys_archive_log');
archiveLog.addQuery('id', current.sys_id);
archiveLog.setLimit(1);
archiveLog.query();
if (archiveLog.next()) {
	if (!GlideStringUtil.nil(archiveLog.getValue('restored')))
		gs.addInfoMessage(gs.getMessage("This record has been restored. Showing archive log history"));
    action.setRedirectURL(archiveLog);
} else {
    action.setRedirectURL(current);
    gs.addErrorMessage(gs.getMessage("No archive log entry found"));
}
