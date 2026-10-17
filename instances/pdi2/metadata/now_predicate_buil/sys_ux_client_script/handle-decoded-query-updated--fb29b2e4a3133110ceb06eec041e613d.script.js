/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        decodedQuery,
        fixedDecodedQuery
    } = event.payload;

    const {
        useHasItemVariableSyntax,
        fixedQueryMode
    } = api.context.props;

    api.setState('decodedQuery', decodedQuery);
    api.setState('fixedDecodedQuery', fixedDecodedQuery);
    api.setState('fixedQueryMode', fixedQueryMode);

    api.data.predicate_builder_controller_encode_decoded_query.execute({
        decodedQuery: JSON.stringify(decodedQuery),
        fixedDecodedQuery: JSON.stringify(fixedDecodedQuery),
        fixedQueryMode,
        useHasItemVariableSyntax
    });
}
