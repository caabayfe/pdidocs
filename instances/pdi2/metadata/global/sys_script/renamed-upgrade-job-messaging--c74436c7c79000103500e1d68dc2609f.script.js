(function executeRule(current, previous /*null when async*/ ) {

    var ClickHereMsg = gs.getMessage('Click here');
	var JobRenameMsg = 'The {0} job has been renamed to {1}. This is a marker record and does nothing. {2} and navigate to the appropriate job';
    if ('5abcea83c79000103500e1d68dc26039' === current.sys_id.toString()) {
        // Upgrade (Does Nothing)
        var DistJobLink = '<a class="linked" href="/sys_trigger.do?sys_id=a3dedfd4c61122750164b2c0adf1021b">' + ClickHereMsg + '</a>';
        gs.addInfoMessage(gs.getMessage(JobRenameMsg, ['\'Upgrade\'', '\'Check distribution for possible upgrade\'', DistJobLink]));
    } else if ('0c86b60bc79000103500e1d68dc26056' === current.sys_id.toString()) {
        // Check Upgrade Script (Does Nothing)
        var DBJobLink = '<a class="linked" href="/sys_trigger.do?sys_id=c09f580ac0a80a29007b0c1d910bc628">' + ClickHereMsg + '</a>';
        gs.addInfoMessage(gs.getMessage(JobRenameMsg, ['\'Check Upgrade Script\'', '\'Check database for possible upgrade\'', DBJobLink]));
    } else if ('a3dedfd4c61122750164b2c0adf1021b' === current.sys_id.toString()) {
        // Check distribution for possible upgrade
        gs.addInfoMessage(gs.getMessage('The job has been renamed from {0} ', ['\'Upgrade\'']));
    } else if ('c09f580ac0a80a29007b0c1d910bc628' === current.sys_id.toString()) {
        // Check database for possible upgrade
        gs.addInfoMessage(gs.getMessage('The job has been renamed from {0} ', ['\'Check Upgrade Script\'']));
    }

})(current, previous);
