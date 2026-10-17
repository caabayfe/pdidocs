/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let columnDefinitions = {
        columns: [
            {
                key: 'rel_type',
                label: await helpers.translate('Relationship type'),
                type: 'string'
            },
            {
                key: 'parent',
                label: await helpers.translate('Parent'),
                type: 'string'
            },
            {
                key: 'child',
                label: await helpers.translate('Child'),
                type: 'string'
            }
        ]
    };
    api.setState('relProps', ({currentValue}) => ({
        ...currentValue,
        columnDefinitions
    }));
}
