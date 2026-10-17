/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const templateMap = api.data.look_up_template.items;
    let template = {};
    for(var i=0;i<templateMap.length; i++){
        var templateField = templateMap[i]['label'];
        var templateFieldValue = templateMap[i]['id'];
         template[templateField] = templateFieldValue; 
    }
    template.stateDisplayValue = templateMap[2]['value'];
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: "viewport_1",
        route: "template-preview",
        fields: null,
        params: {
           "templateSysId": api.state.templateSysId,
           "cb": Date.now()
        }
    });
    api.setState('template' , template);
    api.setState('loading' , false);
    api.data.deduplication_template_can_publish.refresh();
    api.data.deduplication_template_can_unpublish.refresh();
}
