/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  debugger;
  helpers.navigate.to('task-mining-project', {
        sysId: event.payload.taskMiningProjectId,
    }, null, true);
}
