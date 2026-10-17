/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    //reset filter if empty text
    if(event.payload.value == "") {
        const selectedFilter = api.data.fetch_related_record_defintions_1.output
        .find(element => element.id ==  api.state.selectedId)
        .filter;
        api.setState("selectedFilter", selectedFilter);
        api.setState("searchString", "");
        return;
    }
}
