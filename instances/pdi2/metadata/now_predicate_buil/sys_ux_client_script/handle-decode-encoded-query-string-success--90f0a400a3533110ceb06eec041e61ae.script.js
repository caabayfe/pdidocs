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
        const output =
            api.data.predicate_builder_controller_decode_encoded_query_string
                .output;
        const { fixedQueryMode } = api.context.props;

        const queryPayload = output.data.GlidePredicateBuilder_Query;
        const { getDecodedQuery } = queryPayload;
        const decodedQuery = getDecodedQuery?.decodedQuery || {};
        const queryInfoMessages = getDecodedQuery?.infoMessages || [];
        const newDecodedQuery = { ...decodedQuery };

        newDecodedQuery.conditions?.forEach(
            ({ conditionMetadataList = [] }, index) => {
                const updatedCondition = newDecodedQuery.conditions[index];

                const conditionMetadata = {};
                conditionMetadataList.forEach(({ key, value }) => {
                    conditionMetadata[key] = value;
                });

                updatedCondition.conditionMetadata = conditionMetadata;
                delete updatedCondition.conditionMetadataList;
            }
        );

        // Handle optional fixed decoded query
        // GlidePredicateBuilder_FixedQuery is an alias to GlidePredicateBuilder_Query
        const fixedQueryPayload = output.data.GlidePredicateBuilder_FixedQuery;
        const { getDecodedQuery: getFixedDecodedQuery } = fixedQueryPayload;
        const fixedDecodedQuery = getFixedDecodedQuery?.decodedQuery || {};
        const fixedQueryInfoMessages = fixedDecodedQuery?.infoMessages || [];
        const newFixedDecodedQuery = { ...fixedDecodedQuery };

        newFixedDecodedQuery.conditions?.forEach(
            ({ conditionMetadataList = [] }, index) => {
                const updatedCondition = newFixedDecodedQuery.conditions[index];
                const conditionMetadata = {};
                conditionMetadataList.forEach(({ key, value }) => {
                    conditionMetadata[key] = value;
                });

                updatedCondition.conditionMetadata = conditionMetadata;
                delete updatedCondition.conditionMetadataList;
            }
        );

        // Converts from { name: 'foo', value: 'bar' } => {foo: bar}
        // and puts it into the dynamicSchemaData object
        const mapDynamicSchemaData = (field) => {
            if (!field.dynamicSchemaData) {
                return field;
            }

            const newField = { ...field };

            const dynamicSchemaData = {};
            field.dynamicSchemaData.forEach((item) => {
                dynamicSchemaData[item.name] = item.value;
            });

            newField.dynamicSchemaData = dynamicSchemaData;
            return newField;
        };

        // Merges two tableMetadatas, the fixedDecodedQuery and decodedQuery could have
        // the same table but different fields so we don't want to override
        const combineTableMetadata = (
            tableMetadata = [],
            fixedQueryTableMetadata = []
        ) => {
            const combinedMetadata = {};

            // Process both metadata arrays
            [
                ...tableMetadata,
                ...fixedQueryTableMetadata,
            ].forEach((metadata) => {
                const { name, fieldMetadata = [] } = metadata;
                const tableItem = {};

                // Process each field in the field metadata
                fieldMetadata.forEach((field) => {
                    tableItem[field.name] = mapDynamicSchemaData(field);
                });

                // If table already exists, merge the field metadata
                if (combinedMetadata[name]) {
                    combinedMetadata[name] = {
                        ...combinedMetadata[name],
                        ...tableItem,
                    };
                    // Then add __internalTableMetadata to all new fields
                    for (const field in tableItem) {
                        if (
                            !combinedMetadata[name][field]
                                .__internalTableMetadata
                        ) {
                            combinedMetadata[name][
                                field
                            ].__internalTableMetadata = {
                                ...combinedMetadata[name][field],
                            };
                        }
                    }
                } else {
                    const newTableItem = { ...tableItem };
                    for (const field in newTableItem) {
                        newTableItem[field] = {
                            ...newTableItem[field],
                            __internalTableMetadata: {
                                ...newTableItem[field],
                            },
                        };
                    }
                    combinedMetadata[name] = newTableItem;
                }
            });

            return combinedMetadata;
        };

        // Convert table metadata graphQL array to object
        const newTableMetadata = combineTableMetadata(
            getDecodedQuery?.tableMetadata,
            getFixedDecodedQuery?.tableMetadata
        );

        // Combine info messages
        const infoMessages = [...queryInfoMessages, ...fixedQueryInfoMessages];

        api.setState('decodedQuery', newDecodedQuery);
        api.setState('fixedDecodedQuery', newFixedDecodedQuery);
        api.setState('tableMetadata', newTableMetadata);
        api.setState('infoMessages', infoMessages);

        api.emit('NOW_PREDICATE_BUILDER_CTRL#DECODED_QUERY_UPDATED', {
            decodedQuery: newDecodedQuery,
            fixedDecodedQuery: newFixedDecodedQuery,
            fixedQueryMode,
            infoMessages,
        });
    } catch (error) {
        const translatedHeader = await helpers.translate(
            'Error decoding encoded query string'
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
