function transform(input) {
    try {
        var sysIdsInput = input.sys_ids;
        var utils = new AsyncDashboardUtils();
		
        if (sysIdsInput == "") {
            var sysIds = [];

            var permanentErrorRecords = utils.getPermanentErrorJobs();

            while (permanentErrorRecords.next()) {
                sysIds.push(permanentErrorRecords.getUniqueValue());
            }

            sysIds.forEach(function(sys_id) {
                utils.deleteRecord(sys_id);
            });
        } else {
            var sysIdsInputArr = sysIdsInput.split(",");
            sysIdsInputArr.forEach(function(sys_id) {
                utils.deleteRecord(sys_id);
            });
        }
    } catch (ex) {
        gs.error("Error deleting permanent error scheduled jobs: " + ex);
    }
}
