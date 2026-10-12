/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
if(api.state.isCoePluginActive){
  api.setState('fetchAutomationDataInput',`source_record=${api.context.props.modelDefinition.projectId}`);
}
}
