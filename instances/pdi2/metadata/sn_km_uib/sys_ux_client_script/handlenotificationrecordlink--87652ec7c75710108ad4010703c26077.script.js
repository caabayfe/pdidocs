function handler({api, event, imports}) {

var tableName = event.payload.table;
var id = event.payload.sys_id;

var route = "record";
if(tableName == "kb_knowledge"){
    route ="kb_view";
    tableName = api.context.props.table;
}
    var redirectPayload = {
        "redirect": true,
        "route":route,
        "title": "Knowledge",
        "fields": {
            "table": tableName,
            "sysId": id
        }
    };
    if (api.context.props.sysId && !(api.context.props.mode == 'redirect' && api.context.props.base != null))
        redirectPayload.targetRoute = 'current';

    if(api.context.props.mode == 'redirect' && api.context.props.base != null)
        redirectPayload.fields.table = api.data.look_up_base_article.result.sys_class_name.value;

    if (api.context.props.overridePageEvents) {
        const notificationIds = ["versionAlert", "expiryAlert", "errorMsg", "redirectionAlert"];
        const notificationItems = notificationIds.map(id => ({ id }));
        api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', { items: notificationItems });
        api.emit("SN_KNOWLEDGE_VIEW#NOTIFICATION_LINK_CLICKED", redirectPayload);
        return;
    }

    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
