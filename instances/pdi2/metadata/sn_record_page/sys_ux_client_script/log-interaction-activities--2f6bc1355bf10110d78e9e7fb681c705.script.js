function script({
    api,
    event
}) {
    if (event.payload.name !== "activityLogs")
        return;
    const logMap = api.context.props.detailsContext;
    if (logMap.size === 0)
        return;
    // Since payload contains all the activity logs across the tabs,
    // look for the last operation based on the timestamp
    let primaryId, subTable, subId, operation;
    let lastTimestamp = -1;
    for (let log of logMap.values()) {
        const activities = log.activities.entries().next().value[1];
        if (!activities.length)
            continue;
        const context = log.context;
        if (context.table !== "interaction")
            continue;
        // Activity array is sorted by timestamp
        // only needs to compare the last element
        const lastActivity = activities[activities.length - 1];
        const timestamp = parseInt(lastActivity.timestamp, 10);
        if (timestamp > lastTimestamp) {
            lastTimestamp = timestamp;
            primaryId = context.sysId;
            subTable = lastActivity.table;
            subId = lastActivity.sysId;
            operation = lastActivity.operation;
        }
    }
    if (lastTimestamp === -1 || subId === "-1" || subTable === "interaction" || subTable === "interaction_related_record")
        return;
    if (operation !== "opened" && operation !== "inserted" && operation !== "updated")
        return;
    const operationMap = { "inserted": "Created", "opened": "Viewed", "updated": "Updated" };
    const oprString = operationMap[operation] || "";
    const templateFields = `document_table=${subTable}^document_id=${subId}^interaction=${primaryId}^operation=${oprString}`;
    api.data.create_record.execute({
        "table": "interaction_related_record",
        "templateFields": templateFields,
        "useSetDisplayValue": ""
    });
}
