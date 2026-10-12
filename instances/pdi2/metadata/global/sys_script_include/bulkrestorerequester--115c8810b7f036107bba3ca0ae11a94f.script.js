var BulkRestoreRequester = Class.create();
BulkRestoreRequester.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'BulkRestoreRequester',
    scheduleRestore: function() {

        var archiveTable = this.getParameter('sysparm_archive_table');
        var condition = this.getParameter('sysparm_condition');
        var sysIDs = this.getParameter('sysparm_sys_ids');
		
        //Sanitize sys IDs to prevent query injection
        if (sysIDs) {
            var cleanedSysIDs = ('' + sysIDs).replace(/[^a-zA-Z0-9,]/g, '');
            condition = 'sys_idIN' + cleanedSysIDs + '^EQ';
        }
        var bulkRestore = new GlideArchiveBulkRestore(archiveTable);
        var result = bulkRestore.bulkRestore(condition, true);
        return JSON.stringify({
            success: result.success(),
            message: result.message(),
            requestSysId: result.requestSysId()
        });
    }
});
