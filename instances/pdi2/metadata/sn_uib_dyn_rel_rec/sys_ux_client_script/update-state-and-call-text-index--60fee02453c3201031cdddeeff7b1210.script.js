/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState("selectedId", event.payload.item.id);
    api.setState("selectedFilter", event.payload.item.filter);
    api.setState("selectedLabel", event.payload.item.label);
    api.setState("canCreate", event.payload.item.canCreate);
    api.setState("searchString", "");
    if(api.state.selectedTable == event.payload.item.table) {
        return;
    }
    api.setState("selectedTable", event.payload.item.table);
    api.data.has_text_index_1.execute({
        "table": event.payload.item.table
    });
}
