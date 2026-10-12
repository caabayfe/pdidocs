/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { table } = api.state.relatedListPayload;
    const { output } = api.data.get_available_records;
    const { items } = api.state;

    if (output) {
        const result = {};
        output.forEach((record) => {
            const id = record.sys_id;
            result[id] = {
                label: record.displayValue
            };
        });
        api.setState('items', {
            [table]: {
                ...result
            }
        });
    }
}
