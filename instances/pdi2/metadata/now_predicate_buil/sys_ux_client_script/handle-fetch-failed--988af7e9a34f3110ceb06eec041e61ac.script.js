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
	const eventId = event?.payload?.dataElemId;
	const serverError = event?.payload?.errors?.[0]?.message;
	let header;
	let content;

	switch (eventId) {
		case 'predicate_builder_controller_fetch_panel_definitions': {
			header = await helpers.translate('Error fetching panel definitions');
			content = !!serverError ? serverError : await helpers.translate('Unknown error fetching panel definitions');
			break;
		}
		case 'predicate_builder_controller_fetch_table_metadata': {
			header = await helpers.translate('Error fetching table metadata');
			content = !!serverError ? serverError : await helpers.translate('Unknown error fetching table metadata');
			break;
		}
		case 'predicate_builder_controller_decode_encoded_query_string': {
			header = await helpers.translate('Error decoding encoded query string');
			content = !!serverError ? serverError : await helpers.translate('Unknown error decoding encoded query string');
			break;
		}
		case 'predicate_builder_controller_encode_decoded_query': {
			header = await helpers.translate('Error encoding decoded query');
			content = !!serverError ? serverError : await helpers.translate('Unknown error encoding decoded query');
			break;
		}
		default:
			header = await helpers.translate('Unknown error');
			content = !!serverError ? serverError : await helpers.translate('Unknown network error');
			break;
	}

	const infoMessages = [
		{
			status: 'critical',
			header,
			content,
		},
	];

	api.setState('infoMessages', infoMessages);
}
