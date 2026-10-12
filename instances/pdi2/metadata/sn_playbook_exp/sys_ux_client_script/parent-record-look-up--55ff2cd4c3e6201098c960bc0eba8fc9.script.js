/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const recordLookup = event.payload.value ?  'sys_idSTARTSWITH' + event.payload.value +
                                                '^ORnumberLIKE' + event.payload.value +
                                                '^ORshort_descriptionCONTAINS' + event.payload.value : '';

    api.setState('parent_record_look_up', recordLookup);
}
