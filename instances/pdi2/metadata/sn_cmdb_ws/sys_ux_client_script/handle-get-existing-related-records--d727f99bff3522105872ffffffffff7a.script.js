/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { table } = api.state.relatedListPayload;
    const { output } = api.data.get_related_records;
    if (output) {
        const result = {
            [table]: {}
        };
        output.forEach(record => {
            const id = record.targetRecord.sys_id;
            result[table][id] = {
                label: record.targetRecord.displayValue
            };
        });
        let selectedItems = output.map(item => ([
            {
                id: item.targetRecord.sys_id,
                label: item.targetRecord.displayValue
            }
        ]));
        api.setState('itemsRoot', table);
        api.setState('selectedItems', [...selectedItems]);
        
        api.setState('getAvailablePayload', {
            ...api.state.relatedListPayload
        });
    }
}
