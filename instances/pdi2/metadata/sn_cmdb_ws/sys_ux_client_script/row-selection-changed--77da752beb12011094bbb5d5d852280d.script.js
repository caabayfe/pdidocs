/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        SYS_RELATIONSHIP_DEFINITION
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const {
        value: listValue,
        query
    } = event.context.item.value;
    
    // We need to add the currentAttestationStatus to the payload
    // based off of which list the event is coming from, can't use
    // label since it gets translated
    let relDefObjKey = Object.keys(SYS_RELATIONSHIP_DEFINITION)
        .find(d => SYS_RELATIONSHIP_DEFINITION[d].value === listValue);

    api.setState('rowSelection', {
        currentAttestationStatus: SYS_RELATIONSHIP_DEFINITION[relDefObjKey].label,
        ...event.payload,
        query
    });
}
