/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   if(event.elementId == 'publish_template_confirm'){
      api.data.deduplication_template_publish.execute({
            'templateSysId' : api.state.templateSysId
      });
   }else if(event.elementId == 'unpublish_template_confirm'){
      api.data.deduplication_template_unpublish.execute({
                     'templateSysId' : api.state.templateSysId

      });
      
   }
}
