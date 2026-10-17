/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var template = event.payload.value;
    api.setState('selectedTemplate', template);

    var isValid = true;
    if (template != 'none') {
        api.data.look_up_template.refresh();
        var condition = 'active=true^state=1^template!=' + template + "^ORtemplate=NULL";
        api.setState('listViewFilter', condition);
        api.setState("listRefreshRequested", {"timestamp" : Date.now()});
    } else {
        isValid = false;
    }
    api.setState('isTemplateSelectionValid', isValid);
}
