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

    console.log(event.name);
    
    const micClient = imports["global.MICClient"](api, helpers);

    function pageReadyHandler() {
        if (!micClient.isApplicationEnabled()) {
            return micClient.redirectToHomePage();
        }

        helpers.translate('Machine identity accounts').then(val => api.setState('listTitle', val));
    }

    function navigateToUserDetailPage() {
        micClient.navigateToExternal('/sys_user.do?sys_id=' + event.payload.cell.metadata.openRecordMetadata.sysId);
    }

    const handlers = ({
        MACROPONENT_READY: pageReadyHandler,
        'NOW_LIST#CELL_LINK_CLICKED': navigateToUserDetailPage
    });

    var fn = handlers[event.name] ? handlers[event.name] : handlers[event.elementId];
    if (fn)
        fn();
}
