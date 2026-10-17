/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const index = event.context.item.index;
    const checked = event.payload.value;

    // Clone instances
    const instances = JSON.parse(JSON.stringify(api.state.instances));

    // Update the clicked row
    if (instances[index] !== undefined) {
        instances[index].checked = checked;
    }

    // Check if all are selected
    const allChecked = instances.length > 0 && instances.every(item => item.checked);

    // Update state
    api.setState('instances', instances);
    api.setState('selectAll', allChecked);
}
