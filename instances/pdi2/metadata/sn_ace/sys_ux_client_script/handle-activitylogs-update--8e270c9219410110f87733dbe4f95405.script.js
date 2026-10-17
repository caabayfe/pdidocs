
function handler({api, event: {payload: {name, value}}, helpers, imports}) {
    const TEMPLATES_REFRESH_STATE_NAME = 'templatesRefresh';
    const TEMPLATES_REFRESH_OPERATIONS = ['inserted', 'closed', 'deleted', 'updated'];
    const templateRefreshState = api.state[TEMPLATES_REFRESH_STATE_NAME];

    if (name === 'activityLogs' && value && value.size > 0) {
        const mapEntries = Array.from(value);
        if (!mapEntries || mapEntries.length < 1)
            return;
        const curCrudActivities = mapEntries.pop()[1].activities.get('crud');
        if (!curCrudActivities || curCrudActivities.length < 1)
            return;
        const {table, operation, timestamp} = curCrudActivities[curCrudActivities.length - 1];

        if (table.match(/^sys_template\d*$/) && TEMPLATES_REFRESH_OPERATIONS.includes(operation) && timestamp !== templateRefreshState.timestamp) {
                api.setState(TEMPLATES_REFRESH_STATE_NAME, {
                    timestamp,
                });
        }
    }
}
