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
    let {
        tables: sourceData,
        rowCount
    } = api.data.get_process_table_list.output.data.snPo.GlidePromin.getTableList;
    sourceData = sourceData.map((data, i) => ({
        'id': i,
        'tableName': data.id,
        'label': data.label,
        'sublabel': data.id
    }));

    sourceData = sourceData.filter(data => data.label != "");

    const sectionLabel = sourceData.length ?
        await helpers.translate('Showing 1-{0} of {1}', sourceData.length, rowCount) :
        await helpers.translate('No results found');

    const items = [{
        id: 'source-list-items',
        label: sectionLabel,
        children: sourceData
    }];

    api.setState('sourceDataInputValues', items);
    api.setState('sourceDataRowCount', rowCount);
    api.setState('isSourceDataLoaderDisabled', true);
}
