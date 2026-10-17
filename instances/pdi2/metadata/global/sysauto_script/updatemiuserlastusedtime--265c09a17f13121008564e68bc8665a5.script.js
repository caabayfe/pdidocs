var ga = new GlideAggregate('sys_mi_request');
var startOfToday = new GlideDateTime();
startOfToday.setValue(new GlideDateTime().getDate() + ' 00:00:00');
var startOfYesterday = new GlideDateTime(startOfToday);
startOfYesterday.subtract(1 * 24 * 60 * 60 * 1000);
ga.addQuery('last_used', '>=', startOfYesterday);
ga.addQuery('last_used', '<', startOfToday);
ga.groupBy('user');
ga.setGroupByFollowRef(false);
ga.query();
var nhiUserSysIDList = [];
var batchSize = 500;
while (ga.next()) {
    nhiUserSysIDList.push(ga.user.getValue());
    if (nhiUserSysIDList.length >= batchSize || !ga.hasNext()) {
        updateLastUsed(nhiUserSysIDList, startOfYesterday);
        nhiUserSysIDList = [];
    }
}

function updateLastUsed(nhiUserSysIDList, newLastUsedTime) {
    gs.debug('identity_mi: updating last used time for batch of ' + nhiUserSysIDList.length + ' users.');
    var dbu = new GlideDBUpdate('sys_mi_user_tracker');
    var dbq = new GlideDBQuery('sys_mi_user_tracker');
    try {
        dbq.addQuery('sys_id', 'IN', nhiUserSysIDList.join(","));
        dbu.setQuery(dbq);
        dbu.setMultiple(true);
        dbu.setValue('last_used', newLastUsedTime);
        dbu.execute();
    } finally {
        dbu.close();
        dbq.close();
    }
}
