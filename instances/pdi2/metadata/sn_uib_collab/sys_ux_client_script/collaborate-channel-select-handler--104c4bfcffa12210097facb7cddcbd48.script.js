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
    const eventObj = event.payload.eventObj;
    if (!eventObj)
        return;
    if (eventObj.payload.item.sectionId === "call") {
        api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
            viewportElementId: 'modal_viewport',
            route: eventObj.payload.item.route,
            fields: {
                table: api.context.props.parentTable,
                sysId: api.context.props.parentSysId,
                isParentRecordAware: false,
                type: "startConference",
                serviceProvider: {
                    provider: eventObj.payload.item.serviceProvider,
                    number: eventObj.payload.item.number ? eventObj.payload.item.number : null
                },
            }
        });
    } else {
        if (eventObj.payload.item.id === "start-sidebar-discussion") {
            api.emit("RECORD#OPEN_COLLAB_CHAT", {
                fields: {
                    "parentTable": api.context.props.parentTable,
                    "parentSysId": api.context.props.parentSysId
                }
            });
        } else if (eventObj.payload.item.id === "teams-chat") {
            api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
                viewportElementId: "modal_viewport",
                route: "start-msteams-chat-modal",
                fields: null,
                params: {
                    table: api.context.props.parentTable,
                    sysId: api.context.props.parentSysId,
                    descriptionField: "short_description"
                }
            });
        } else if (eventObj.payload.item.id === "import-teams-chat") {
            const fields = {
                table: api.context.props.parentTable,
                sysId: api.context.props.parentSysId
            };
            const params = {};
            if (eventObj.context.item && eventObj.context.item.value && eventObj.context.item.value.chatSysId)
                params.chatRecordSysId = eventObj.context.item.value.chatSysId;
            api.emit('NAV_ITEM_SELECTED', {
                route: "ms-teams-import",
                title: await helpers.translate("View Teams Chat"),
                fields,
                params,
                targetRoute: 'current' // to open as sub-tab
            });
        } else return {};
    }
}
