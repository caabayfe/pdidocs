/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    // Script: Handle Data Broker Failed

    const runtime = JSON.parse(JSON.stringify(api.state.runtimeState));
    runtime.emptyState = {
        name: 'not_found',
        heading: {
            label: await helpers.translate("The CAB meeting doesn't exist")
        },
        content: await helpers.translate("The meeting doesn't exist. Contact your CAB manager"),
        illustration: "error",
        action: {}
    };
    api.setState('runtimeState', runtime);
}
