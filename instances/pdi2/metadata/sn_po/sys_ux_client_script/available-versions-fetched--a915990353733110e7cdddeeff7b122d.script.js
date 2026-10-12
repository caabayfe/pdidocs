/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Get the versions
    const comparableVersions = api.data.fetch_available_versions_1.output.data.GlidePromin_Query.comparableVersions;

    const emptyStateActions = [];

    if (comparableVersions && comparableVersions.length > 0) {
        const versionList = comparableVersions.map(v => ({
            id: v.id,
            label: v.name + (v.lastMined ? ' (' + v.lastMined + ')' : ''),
            lastMined: v.lastMined,
        }));
        api.setState('available_versions', versionList);
        if (api.state.lookForNextAvailableLatestVersion) {
            emptyStateActions.push({
                label: await helpers.translate("Open latest available version"),
                variant: "primary"
            });
            api.setState('nextAvailableLatestVersionId', versionList[0].id);
        }
    }
    if (api.state.lookForNextAvailableLatestVersion) {
        api.setState('page_empty_state', {
            errorType: await helpers.translate("Project version unavailable"),
            message: await helpers.translate("The version you’re trying to access can’t be opened."),
            actions: emptyStateActions,
            illustration: 'error'
        });
    }
}
