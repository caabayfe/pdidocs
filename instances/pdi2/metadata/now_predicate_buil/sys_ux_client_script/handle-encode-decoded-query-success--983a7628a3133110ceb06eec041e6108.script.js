/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
	try {
		const queryData =
			event.payload.data.output.data.GlidePredicateBuilder_Query;

		const { getEncodedQuery } = queryData;

		const encodedQuery = getEncodedQuery?.encodedQuery || '';
		const combinedEncodedQuery =
			getEncodedQuery?.combinedEncodedQuery || '';
		const fixedEncodedQuery = getEncodedQuery?.fixedEncodedQuery || '';
		const fixedQueryMode = getEncodedQuery?.fixedQueryMode || '';

		let infoMessages = getEncodedQuery?.infoMessages || [];

		api.setState('infoMessages', infoMessages);

		api.emit('NOW_PREDICATE_BUILDER_CTRL#ENCODED_QUERY_UPDATED', {
			encodedQuery,
			combinedEncodedQuery,
			fixedEncodedQuery,
			fixedQueryMode,
			infoMessages,
		});
	} catch (error) {
		const translatedHeader = await helpers.translate(
			'Error encoding decoded query'
		);
		const infoMessages = [
			{
				status: 'ERROR',
				header: translatedHeader,
				content: error.message,
			},
		];

		api.setState('infoMessages', infoMessages);
	}
}
