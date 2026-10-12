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
    api.setState("searchString", event.payload.fieldValue); //need to set value for clearing later
    if (!(api.data.fetch_related_record_defintions_1 && api.data.fetch_related_record_defintions_1.output))
        return;
    const oldFilter =
        api.data.fetch_related_record_defintions_1.output
        .find(element => element.id == api.state.selectedId)
        .filter;
    if (event.payload.fieldValue == '') {
        api.setState("selectedFilter", oldFilter);
        return;
    }
    api.setState("selectedFilter", oldFilter + "^123TEXTQUERY321=" + event.payload.fieldValue);
    return;
}
