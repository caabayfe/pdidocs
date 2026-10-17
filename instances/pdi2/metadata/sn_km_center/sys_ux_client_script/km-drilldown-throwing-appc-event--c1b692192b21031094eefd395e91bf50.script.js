/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var eventsMapping = {
        'SN_COMPONENT_FILTER#APPLIED_ITEMS': 'KM Click filter on KB drilldown',
        'NOW_LIST#CELL_LINK_CLICKED': 'KM Click list item' ,
        'NOW_CARD#CLICKED': 'KM Click Needs Attention card on drilldown'
    };
    var recordClassMapping = {
        'kb_knowledge_base': 'Click KM knowledge base on Knowledge Base Health Page',
        'kb_knowledge': 'KM Click article on drilldown list'
    };

    var eventName;
    if (event.name === 'NOW_LIST#CELL_LINK_CLICKED') {
        var recordClass = event.payload && event.payload.cell && event.payload.cell.metadata && event.payload.cell.metadata.recordClassName;
        eventName = recordClass ? recordClassMapping[recordClass] : undefined;
    } else {
        eventName = eventsMapping[event.name];
    } 
    if (eventName) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: {}
        });
    }
    

}
