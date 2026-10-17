/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { query, table } = event.payload;
    const { resources } = api.context.props;
    const list = resources.find(resource => resource.targetTable == table);
    const {
        newRecordRoute,
        targetTable,
        sourceTable
    } = list;
    if (newRecordRoute == 'record') {
        helpers.navigate.to('record', {table: targetTable, sysId: '-1'}, { query }, false, false, 'current');
    } else if (newRecordRoute == 'manual-create-ci') {
        let ciRefQuery = list.value.startsWith("REL:") ? null : query; //only passing in ref query for non-scripted references
        //eventually this wouldn't happen, as we plan to somehow hide "New" button for scripted references
        helpers.navigate.to('manual-create-ci', {}, { sysClassName: targetTable, ts: Date.now(), parentCiRefQuery: ciRefQuery}, false, false, 'current');
    }
}
