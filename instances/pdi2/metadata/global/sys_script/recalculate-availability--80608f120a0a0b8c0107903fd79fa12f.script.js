(function executeRule(current, previous /*null when async*/ ) {
    if (previous && previous.cmdb_ci.nil() && current.cmdb_ci.nil())
        return; // do not calculate if CI is null and was previously null

    var currentData = {
        cmdb_ci: current.cmdb_ci,
        outage: current
    };
    var previousData = {
        cmdb_ci: previous ? previous.cmdb_ci : null,
        outage: previous
    };

    new global.RecalculateAvailability().processOutageChange(currentData, previousData, current.operation());
})(current, previous);
