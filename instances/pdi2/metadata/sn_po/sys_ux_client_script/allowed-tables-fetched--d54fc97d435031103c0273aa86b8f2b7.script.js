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
    let { tables, rowCount } = event.payload.data.output.data.snPo.GlidePromin.getTableList;
    if (!tables || tables.length === 0) {
        api.setState('entitiesListItems', []);
        return;
    }
    let sourceFieldData = tables.map((table) => ({
        'id': table.id,
        'tableName': table.id,
        'label': table.label,
        'sublabel': table.id,
    }));

    const sectionLabel = sourceFieldData.length
        ? await helpers.translate('Showing 1-{0} of {1}', sourceFieldData.length, rowCount)
        : await helpers.translate('No results found');
    const items = [{ id: 'source-list-items', label: sectionLabel, children: sourceFieldData }];

    const allowedTablesMap = {...api.state.allowedTablesMap};
    const entityForm = {...api.state.entityForm};
    entityForm.fields.entity.listItems = items;
    allowedTablesMap[entityForm.fields.sourceType.selectedValue] = items;
    api.setState('allowedTablesMap', allowedTablesMap);
    api.setState('entityForm', entityForm);
}
