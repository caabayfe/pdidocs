/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const results = api.data.look_up_experience_records.results;
    const entryList = results && results.length && results.map(entry => {
        const listEntry = {
            id: entry.sys_id.value,
            label: entry.name.value,
            sublabel: entry.short_descrition && entry.short_descrition.value ? entry.short_descrition.value : ''
        };

        if (listEntry.id === api.context.props.experience)
            api.setState('playbook_experience', listEntry); 

        return listEntry;
    }) || [];

    if (entryList.length)
        api.setState('experience_list', entryList);
}
