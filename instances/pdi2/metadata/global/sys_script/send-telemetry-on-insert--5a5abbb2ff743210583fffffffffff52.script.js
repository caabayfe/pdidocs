(function executeRule(current, previous /*null when async*/ ) {
	var category = 'platform_analytics';
	var instrumentation_point = 'new_analytical_model';
	var instrumentation_event = 'analytics_source_data';

	//Data to capture
    var sampleMap = new GCFSampleMap();
	sampleMap.put('source_id', current.id);
    sampleMap.put('frequency', current.frequency);
	sampleMap.put('retention_days', getRetentionBucket(current.retention_days));
	sampleMap.put('user_role', getUserRole(current.sys_updated_by));
	sampleMap.put('created_by_system', current.is_conversion_source);

	//Send telemetry
    GCFCollector.recordUsageEvent(category, instrumentation_point, instrumentation_event, sampleMap);
})(current, previous);

function getRetentionBucket(retentionDays) {
    if (retentionDays < 31)
        return "less than a month";
    else if (retentionDays < 91)
        return "31 - 90 days";
    else if (retentionDays < 121)
        return "91 - 120 days";
    else if (retentionDays < 181)
        return "121 - 180 days";
    else if (retentionDays < 366)
        return "181 - 365 days";
    else if (retentionDays < 731)
        return "366 - 730 days";

    return "more than 730 days";
}

function getUserRole(user) {
    var glideUser = new GlideUser().getUser(user);
	var allRoles = glideUser.getAllRoles();
    if (allRoles.contains("admin"))
        return "admin";
    else if (allRoles.contains("pa_admin"))
        return "pa_admin";
    else if (allRoles.contains("pa_data_collector"))
        return "pa_data_collector";

    return "invalid";
}
