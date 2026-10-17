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
    const comparableVersions = api.data.fetch_available_versions.output.data.GlidePromin_Query.comparableVersions;
    const stageItems = api.state.stageItems.map((item) => {
        if (item.id === 'overview') {
            return { ...item,
                progress: comparableVersions.length > 0 ? 'done' : 'none'
            };
        }
        return item;
    });
    api.setState('stageItems', stageItems);
}
