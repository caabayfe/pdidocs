/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.data.changes.includes('percent_complete')) {
        api.setState('progressValue', event.payload.data.record.percent_complete.value);
    }
    if (event.payload.data.changes.includes('result')) {
        helpers.timing.setTimeout(() => {
            var parsedResult = '';
            try {
                parsedResult = JSON.parse(event.payload.data.record.result.value);
            } catch(e) {};
            api.setState('progressId', '');
            api.setState('progressValue', 0);
            api.emit('RELOAD_DATA', {});

            // Start notification
            if (parsedResult) {
                const {
                    handleAttestationNotification
                } = imports['sn_cmdb_ws.cmdbWSAttestationUtil']();

                const { hasCmdbEditor, hasAdminOrMaint } = imports['sn_cmdb_ws.userRoleUtils']();

                handleAttestationNotification({result: parsedResult}, hasCmdbEditor, hasAdminOrMaint, api, event, helpers);
            }
            // End notification
            // Set progress donut
            const {
                setDonutProgress
            } = imports['sn_cmdb_ws.cmdbWSAttestationUtil']();
            setDonutProgress(api, event, helpers);
            // End progress donut
        }, 1000);
    }
}
