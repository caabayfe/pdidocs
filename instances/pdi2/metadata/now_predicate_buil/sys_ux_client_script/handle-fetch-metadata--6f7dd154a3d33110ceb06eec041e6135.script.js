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
    const {
        requestType,
        metaPayload
    } = event.payload;

    switch (requestType) {
        case 'tableMetadata':
            {
                api.data.predicate_builder_controller_fetch_table_metadata.execute({
                    ...metaPayload
                });
            }
        default:
            console.error('Unknown requestType fetching metadata', requestType);
            return;
    }
}
