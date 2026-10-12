/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  let view = "library"; 
  let defaultSysId = api.context.props.templateSysId;
  if(defaultSysId){
   view = "template";
   api.setState('templateSysId', defaultSysId);
 }
  api.setState('viewMode',view);
}
