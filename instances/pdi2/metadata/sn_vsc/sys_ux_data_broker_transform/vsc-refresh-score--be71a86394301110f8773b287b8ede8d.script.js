function transform(input) {
	var constants = new sn_vsc.SecurityCenterConstants();
    //get PA job logs row count before execution
    function getRowCount() {
        var gr_logs = new GlideRecord(new sn_vsc.SecurityCenterConstants().PAJobLogs);
        gr_logs.query();
        return gr_logs.next() ? gr_logs.getRowCount() : '0';
    }

    var previousCount = getRowCount();
    // get VSC calculate compliance job and execute it.
    var compliance_job = new GlideRecord('sysauto_script');
    if (compliance_job.get('sys_id', constants.SCMonthlyJob)) {
        gs.executeNow(compliance_job);
    }

    //poll for 200ms to get collected state
    var timeBeforePolling = new Date().getTime();
    var newCount = getRowCount();
    while (newCount === previousCount) {
        var newTime = new Date().getTime();
        if (newTime > timeBeforePolling + 200) {
            newCount = getRowCount();
        }
    }

    timeBeforePolling = new Date().getTime();
    var state = checkState();
    while (state === "collecting") {
        newTime = new Date().getTime();
        if (newTime > timeBeforePolling + 500) {
            state = checkState();
        }
    }

    function checkState() {
        var gr_logs = new GlideRecord(new sn_vsc.SecurityCenterConstants().PAJobLogs);
        gr_logs.orderByDesc('sys_created_on');
        gr_logs.setLimit(1);
        gr_logs.query();
        if (gr_logs.next()) {
            return gr_logs.state.toString();
        }
    }

    if (state !== "collecting") {
        return state;
    }
}
