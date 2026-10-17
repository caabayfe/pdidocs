/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const testLinkedUrl = api.data.get_linked_test_url___tracing_metadata_1.output;

    if (testLinkedUrl) {
        helpers.timing.setTimeout(function() {
            this.window.open(testLinkedUrl, '_blank');
        });
    }
}
