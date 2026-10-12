/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const selectAll = event.payload.value;

  const updatedInstances = api.state.instances.map(item => ({
    ...item,
    checked: selectAll
  }));
  api.setState('selectAll', selectAll);
  api.setState('instances', updatedInstances);
}
