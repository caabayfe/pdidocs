/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const { payload = {} } = event;
  const { processDefinitionId, parentRecord, input } = payload;

  if (!api.data.launch_standalone_playbook) {
    return;
  }
  
  api.setState("processDefinitionId", processDefinitionId);
  api.setState("parentRecord", parentRecord);
  api.setState("input", input, () => {
    api.data.launch_standalone_playbook.refresh();
  });
}
