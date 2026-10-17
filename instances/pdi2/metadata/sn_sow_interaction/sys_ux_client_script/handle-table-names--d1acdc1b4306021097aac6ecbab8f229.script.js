/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let results = api.data.get_table_names.output;
    let tables = results.tables ? results.tables : [];
    let listItems = [{
        id: "recommended",
        label: await helpers.translate('Recommended Tables'),
        children: [{
                'id': 'incident',
                'label': await helpers.translate('Incident'),
                'sublabel': 'incident',
            }, {
                'id': 'kb_knowledge',
                'label': await helpers.translate('Knowledge'),
                'sublabel': 'kb_knowledge',
            },
            {
                'id': 'problem',
                'label': await helpers.translate('Problem'),
                'sublabel': 'problem',
            }, {
                'id': 'change_request',
                'label': await helpers.translate('Change Request'),
                'sublabel': 'change_request',
            }, {
                'id': 'sc_request',
                'label': await helpers.translate('Request'),
                'sublabel': 'sc_request',
            }
        ]
    }];
    let totalTableCountInInstance = results.totalCount ? results.totalCount : 0;
    let allTablesListItems = {
        id: "allTablesValues",
        label: "",
        children: []
    };


    const excludedIdsArray = ['incident', 'kb_knowledge', 'problem', 'change_request','sc_request'];
    const excludedIds = excludedIdsArray.reduce((acc, id) => {
        acc[id] = true;
        return acc;
    }, {});
    //for constant time lookup into the array

    let excludedCount = 0;
    let includedCount = 0;

    tables.forEach((res) => {
        if (!excludedIds[res.name]) {
            allTablesListItems.children.push({
                id: res.name,
                label: res.label,
                sublabel: res.name,
            });
            includedCount++;
        } else {
            excludedCount++;
        }
    });

    let adjustedTotalTableCount = totalTableCountInInstance - excludedCount;

    allTablesListItems.label = await helpers.translate('{0}', `Showing 1-${includedCount} of ${adjustedTotalTableCount}`);
    
    listItems.push(allTablesListItems);
    api.setState("listItems", listItems);
}
