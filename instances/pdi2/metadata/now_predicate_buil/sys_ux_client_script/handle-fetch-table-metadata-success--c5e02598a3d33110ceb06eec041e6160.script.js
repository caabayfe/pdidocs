/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
	try {
		const queryData =
			event.payload.data.output.data.GlidePredicateBuilder_Query;
		const { infoMessages, tableMetadata } = queryData.getTableMetadata;

		const newTableMetadata = {};

		tableMetadata.forEach((metadata) => {
			const { name, fieldMetadata } = metadata;

			const tableItem = {};

			fieldMetadata.forEach((field) => {
				tableItem[field.name] = field;
			});

			const newTableItem = { ...tableItem };
			for (const field in newTableItem) {
				newTableItem[field] = {
					...newTableItem[field],
					__internalTableMetadata: {
						...newTableItem[field],
					},
				};
			}
			newTableMetadata[name] = newTableItem;
		});

		api.setState('tableMetadata', newTableMetadata);
		api.setState('infoMessages', infoMessages);
	} catch (error) {
		const translatedHeader = await helpers.translate(
			'Error fetching table metadata'
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
