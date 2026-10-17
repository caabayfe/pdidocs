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
    (async function() {
        var results = api.data.specs.output.data.GlideRecord_Query.sys_kmf_module_crypto_spec._results;

        var state = [{
            id: null,
            label: await helpers.translate("All specifications")
        }];
        for (var i = 0; i != results.length; ++i) {
            var result = results[i];
            state.push({
                id: result._row_data.uniqueValue,
                label: result.crypto_purpose.displayValue
            });
        }
        api.setState("specs", state);
    })();
}
