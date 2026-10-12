async function handler({api, event, helpers, imports}) {
    const {
        formatLastUpdInfoText
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    if (api.data?.get_aging_tasks_last_updated.results && api.data?.get_aging_tasks_last_updated.results[0]) {
        const {
            sys_updated_on: {
                displayValue: agingTasksLastUpdated
            },
        } = api.data.get_aging_tasks_last_updated.results[0];
        api.setState('agingTasksLastUpdatedInfo', await formatLastUpdInfoText(helpers, agingTasksLastUpdated));
    }
}
