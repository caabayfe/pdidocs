var KEEP_COUNT_PROP = 'com.snc.platform.security.oauth.mcp.tool_scan_job_retention_count';
var KEEP_COUNT = parseInt(gs.getProperty(KEEP_COUNT_PROP, '10'), 10) || 10;
var TABLE = 'auth_server_connection_tool_scan_job';

var authServersProcessed = 0;

// Collect distinct auth_server values that have more than KEEP_COUNT jobs
var agg = new GlideAggregate(TABLE);
agg.addAggregate('COUNT', 'auth_server');
agg.groupBy('auth_server');
agg.addHavingCondition('COUNT', 'auth_server', '>', KEEP_COUNT);
agg.query();

while (agg.next()) {
    var authServer = agg.getValue('auth_server');
    if (!authServer)
        continue;

    // Collect sys_ids of the KEEP_COUNT most recent jobs to retain
    var keep = new GlideRecord(TABLE);
    keep.addQuery('auth_server', authServer);
    keep.orderByDesc('sys_created_on');
    keep.chooseWindow(0, KEEP_COUNT);
    keep.query();

    var keepIds = [];
    while (keep.next())
        keepIds.push(keep.getUniqueValue());

    if (keepIds.length === 0)
        continue;

    // Delete all jobs for this auth_server NOT in the keep set.
    // Exclude running jobs to avoid cascade-deleting results mid-scan.
    var del = new GlideRecord(TABLE);
    del.addQuery('auth_server', authServer);
    del.addQuery('sys_id', 'NOT IN', keepIds.join(','));
    del.addQuery('job_status', '!=', 'running');
    del.query();
    del.deleteMultiple();
    authServersProcessed++;
}

gs.info('Tool scan job purge complete. Purged old jobs beyond last ' + KEEP_COUNT + ' per auth_server. Auth servers processed: ' + authServersProcessed + '.');
