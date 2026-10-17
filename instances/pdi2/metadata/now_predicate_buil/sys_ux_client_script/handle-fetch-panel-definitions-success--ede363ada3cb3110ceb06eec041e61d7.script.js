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

        const { getPanelData, getTableMetadata } = queryData;

        const panelDefinitions =
            getPanelData?.panelData?.panelDefinitions || [];
        const panelDataInfoMessages =
            getPanelData?.panelData?.infoMessages || [];
        const tableMetadata = getTableMetadata?.tableMetadata || [];
        const tableMetadataInfoMessages = getTableMetadata?.infoMessages || [];

        // Convert table metadata graphQL array ato object
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

        // Convert panel definitions graphQL array to object
        const newPanelDefinitions = {};
        const createLabelCountMap = (items) => {
            const counterMap = {};
            items.forEach(({ displayValue }) => {
                counterMap[displayValue] = (counterMap[displayValue] || 0) + 1;
            });
            return counterMap;
        };

        const transformPanelDefinition = (panelDefinition) => {
            const { items: oldItems, searchResults, source } = panelDefinition;
            const duplicateMap = createLabelCountMap(oldItems);

            const items = oldItems.map((item) => {
                if (duplicateMap[item.displayValue] <= 1) {
                    return item;
                }
                return { ...item, secondaryLabel: item.internalValue };
            });

            if (!searchResults) {
                return { source, items };
            }

            const {
                loadMoreRequestParams,
                allItemsLoaded,
                searchTerm,
            } = searchResults;

            // graphQL returns loadMoreRequestParams as a name value pair
            const newLoadMoreRequestParams = {
                source,
            };

            loadMoreRequestParams.forEach(({ name, value }) => {
                newLoadMoreRequestParams[name] = value;
            });

            return {
                allItemsLoaded: allItemsLoaded,
                items,
                loadMore: true,
                loadMoreRequestParams: newLoadMoreRequestParams,
                searchTerm,
                updateOperation: 'MERGE',
            };
        };

        const createDynamicAttributeTableMetadata = ({ items }) => {
            const tableMetadataItem = {};
            items.forEach(({ internalValue, metadata }) => {
                const parsedMetadata = {};

                let type;

                metadata.forEach(({ name, value }) => {
                    if (name === 'type') {
                        type = value;
                    }
                    parsedMetadata[name] = value;
                });

                tableMetadataItem[internalValue] = {
                    type: type,
                    dynamicSchemaData: parsedMetadata,
                };
            });
            return tableMetadataItem;
        };

        panelDefinitions.forEach((panelDefinition) => {
            const source = panelDefinition.source;
            newPanelDefinitions[source] = transformPanelDefinition(
                panelDefinition
            );
            if (source.startsWith('__dynamic_category__')) {
                newTableMetadata[source] = createDynamicAttributeTableMetadata(
                    panelDefinition
                );
            }
        });

        const infoMessages = [
            ...panelDataInfoMessages,
            ...tableMetadataInfoMessages,
        ];

        api.setState('tableMetadata', newTableMetadata);
        api.setState('panelDefinitions', newPanelDefinitions);
        api.setState('infoMessages', infoMessages);

        api.emit('NOW_PREDICATE_BUILDER_CTRL#PANEL_DEFINITIONS_UPDATED', {
            tableMetadata: newTableMetadata,
            panelDefinitions: newPanelDefinitions,
            infoMessages,
        });
    } catch (error) {
        const translatedHeader = await helpers.translate(
            'Error fetching panel definitions'
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
