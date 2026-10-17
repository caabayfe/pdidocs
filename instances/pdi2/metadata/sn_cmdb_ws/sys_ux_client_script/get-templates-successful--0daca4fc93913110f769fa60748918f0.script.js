/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
      let templateList = api.data.deduplication_template_get_all_templates.output.templates;

      var template = '';
      var condition = 'active=true^state=1';
      var validTemplateSelection = true;
      if (api.state.isTemplateReadOnly) {
            template = api.context.props.templateSysId;

            // check if somehow the user landed on the page without any sys id set 
            // and did not come from "Associate to Template" button
            // For example, came with direct link but no params
            if (template) {
                  condition += "^template!=" + template + "^ORtemplate=NULL";
            } else {
                  template = 'none';
            }
      } else {
            // If we are allowing user to choose, don't populate the selection
         template = 'none';
         validTemplateSelection = false;
      }
      condition += "^EQ";

      // set the selected template even if it is empty, 
      // in case the user has not created any templates yet
      api.setState('selectedTemplate', template);
      api.setState('isTemplateSelectionValid', validTemplateSelection);
      api.setState('listViewFilter', condition);
      api.setState("listRefreshRequested", {"timestamp" : Date.now()});
}
