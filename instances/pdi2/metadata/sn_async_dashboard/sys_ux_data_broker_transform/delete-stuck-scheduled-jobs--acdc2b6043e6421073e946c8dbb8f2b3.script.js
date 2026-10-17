function transform(input) {
    try {
		var utils = new AsyncDashboardUtils();
        var sysIdsInput = input.sys_ids;

        if (sysIdsInput == "") {
            var sysIds = [];

            var stuckJobs = utils.getStuckJobs();

            while (stuckJobs.next()) {
                sysIds.push(stuckJobs.getUniqueValue());
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
        gs.error("Error deleting stuck scheduled jobs: " + ex);
    }
}
