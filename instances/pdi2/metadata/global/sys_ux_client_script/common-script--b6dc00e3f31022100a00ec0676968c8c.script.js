/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const micClient = imports["global.MICClient"](api, helpers);
    
    function translateListHeaderTitle() {
        helpers.translate("High privilege machine accounts").then(translatedText => api.setState('listHeaderTitle', translatedText));
    }
    const handlers = ({
        MACROPONENT_READY: translateListHeaderTitle,
        "NOW_LIST#CELL_LINK_CLICKED": () => micClient.navigateToUserRecord(event.payload.cell.metadata.openRecordMetadata.sysId)
    });

    var fn = handlers[event.name] ? handlers[event.name] : handlers[event.elementId];
    if (fn)
        fn();
}
