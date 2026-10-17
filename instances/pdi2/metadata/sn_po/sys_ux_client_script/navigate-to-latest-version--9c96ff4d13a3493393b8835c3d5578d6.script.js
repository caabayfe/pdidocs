/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var versions = api.data.fetch_available_versions?.output?.data?.GlidePromin_Query?.comparableVersions || [];
    if (!versions.length) return;

    var sorted = versions.slice().sort(function(a, b) {
        if (!a.lastMined) return 1;
        if (!b.lastMined) return -1;
        return new Date(b.lastMined) - new Date(a.lastMined);
    });

    helpers.navigate.to('process-details', {
        versionId: sorted[0].id,
    }, {
        selectedTab: 'analyst_workbench'
    }, true);
}
