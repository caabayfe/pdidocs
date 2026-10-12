/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let popoverId = `${event.eventInfo.sourceElementId}`;
    if (event.context.item.parent) {
        popoverId = popoverId + `-${event.context.item.parent.repeaterNodeId}_${event.context.item.parent.index}_`;
    } else
        popoverId = popoverId + '-';
    popoverId = popoverId + `${event.context.item.repeaterNodeId}_${event.context.item.index}_${event.elementId}`;

    var oldSysId = api.state.referenceSysid;
    var newSysId = event.context.item.value.sysId;
    var table = event.context.item.value.table;
    api.setState('popoverId', popoverId);
    api.setState('referenceTable', table);
    api.setState('referenceSysid', newSysId);

    if(oldSysId === newSysId){ //This is to ensure we refresh the data broker when user clicks on the same 'i' icon twice consecutively
        api.data.check_read_access_on_record_1.refresh();
    }
}
