/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   let query = api.context.props.query;
   var library = api.context.props.librarySysId;
   var validLibrarySelection = true;

   // if there is a query, we were sent here from "Associate to Template button"
   // so let's start with fresh start by selecting the 'none' library
   api.setState('isTemplateReadOnly', !query);
   if(query || !library){
      // if the selector is disabled
      // start with none value
      library = 'none';
      validLibrarySelection = false;
      api.setState('templateSelectionDisabled', true);
   }
   api.setState('selectedLibrary', library);
   api.setState('isLibrarySelectionValid', validLibrarySelection);
   api.setState("matchingTasksSearchTerm", "");
   api.setState("userSelectedTasksSearchTerm", "");
   api.setState("matchingFilteredTasks", []);
   api.setState("userSelectedFilteredTasks", []);
   api.setState("matchingMultiSearch", "");
   api.setState("userSelectedMultiSearch", "");
   api.setState('defaultTab', 1);
   api.setState("listRefreshRequested", {"timestamp" : Date.now()});

   api.data.deduplication_template_get_all_libraries.refresh();
   api.data.deduplication_template_get_all_templates.refresh();
}
