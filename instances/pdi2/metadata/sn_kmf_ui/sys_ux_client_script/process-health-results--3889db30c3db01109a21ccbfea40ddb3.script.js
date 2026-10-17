/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    helpers,
    imports
}) {
    // information retrieved from a data resource
    var output;
    var snKmfUi;

    // irrespective of the data resource, stores the health info in the same basic json structure 
    var data;

    if (api.state.isEventFromResolveClick == "true") {
        output = api.data && api.data.kmf_auto_resolution && api.data.kmf_auto_resolution.output || null;
        snKmfUi = output && output.data && output.data.snKmfUi || null;
        data = snKmfUi && snKmfUi.resolution && snKmfUi.resolution.resolve || null;
    } else {
        output = api.data && api.data.status && api.data.status.output || null;
        snKmfUi = output && output.data && output.data.snKmfUi || null;
        data = snKmfUi && snKmfUi.status && snKmfUi.status.health || null;
    }

    // make sure we have a response of some sort
    if (!data) {
        console.error("Empty response received from the server.");
        // Let through to display a warning on the page.
    }

    const {
        loadState
    } = imports['sn_kmf_ui.KMFUIHealth']();
    if (!loadState) {
        console.error("Invalid function: loadState()");
        return;
    }

    loadState(data, api, helpers).then(state => {
        const keys = Object.keys(state);
        for (let i = 0; i < keys.length; ++i)
            api.setState(keys[i], state[keys[i]]);
        console.debug("KMF Health", state);
    });
}
