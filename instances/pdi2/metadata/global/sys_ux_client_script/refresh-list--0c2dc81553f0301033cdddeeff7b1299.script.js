function handler({api, event: {payload, payload: {name, value}}, helpers, imports}) {
    if (name === 'activityLogs' && value && value.size > 0) {
        const operationList = ['modified', 'inserted', 'deleted', 'closed'];
        // Transform "value" and get the latest entry
        const map = Array.from(value).pop()[1];        
        const {operation, sysId, timestamp} = map.activities.get('crud')[0];
        if (operationList.includes(operation) && sysId !== "-1") {
            api.setState('listRefresh', {timestamp, background: true });
        }         
    }
}
