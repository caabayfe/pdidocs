function handler({
    api,
    event,
    imports
}) {
    var tableName = api.context.props.table;
    var id = event.payload.item.id;
    var route = "kb_view";

    var redirectPayload = {
        "redirect": '',
        "route": route,
        "title": "Knowledge",
        "fields": {
            "table": tableName,
            "sysId": id
        },
        "targetRoute": "current"
    };
    if(api.context.props.overridePageEvents){
        api.emit("SN_KNOWLEDGE_VIEW#DROPDOWN_SELECTION_CLICKED", redirectPayload);
        return;
    }
    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
