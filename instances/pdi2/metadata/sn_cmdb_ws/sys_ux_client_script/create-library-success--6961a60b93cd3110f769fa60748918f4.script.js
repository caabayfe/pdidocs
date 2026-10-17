/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var errorMessage = event.payload.data.output.display_error;
    if(errorMessage != ''){
    helpers.translate("{0}", errorMessage).then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "error_run",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": text,
                "action": { "type": "dismiss" }
            }]
        });
        
    });
    }else {
    helpers.translate("Library " + api.state.libraryNameSet+  " created successfully").then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "successful_run",
                "status": "positive",
                "icon": "info-circle-outline",
                "content": text,
                "action": { "type": "dismiss" }
            }]
        });
    });
    api.data.deduplication_template_get_library_tree.refresh();
    api.data.deduplication_template_get_all_libraries.refresh(); 
    }  
}
