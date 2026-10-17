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
        const queryData = event?.payload?.data?.output?.data?.GlidePredicateBuilder_Query;
        const panelData = queryData?.getDynamicAttributesPanelData?.panelData;
        const panelDefinitions = panelData?.panelDefinitions?.[0] || {};
        const infoMessages = panelData?.infoMessages || [];

        const {
            items = [],
            searchResults = {},
            source = '',
        } = panelDefinitions;

        const {
            loadMoreRequestParams: loadMoreRequestParamsList = [],
            allItemsLoaded = false,
            searchTerm = '',
        } = searchResults || {};

        const loadMoreRequestParams = {
            source,
        };

        if (Array.isArray(loadMoreRequestParamsList)) {
            loadMoreRequestParamsList.forEach(({
                name,
                value
            }) => {
                loadMoreRequestParams[name] = value;
            });
        }

        const newPanelDefinitions = {
            [source]: {
                allItemsLoaded: allItemsLoaded,
                items,
                loadMore: true,
                loadMoreRequestParams,
                searchTerm,
                updateOperation: 'MERGE',
            },
        };

        const tableMetadataItem = {};
        
        items.forEach(({
            internalValue,
            metadata
        }) => {
            const parsedMetadata = {};

            let type;
            metadata.forEach(({
                name,
                value
            }) => {
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

        const newTableMetadata = {
            [source]: tableMetadataItem,
        };

        api.setState('panelDefinitions', newPanelDefinitions);
        api.setState('tableMetadata', newTableMetadata);
        api.setState('infoMessages', infoMessages);

        api.emit('NOW_PREDICATE_BUILDER_CTRL#PANEL_DEFINITIONS_UPDATED', {
            tableMetadata: newTableMetadata,
            panelDefinitions: newPanelDefinitions,
            infoMessages,
        });
    } catch (error) {
        const translatedHeader = await helpers.translate(
            'Error fetching panel definitions for dynamic attributes'
        );
        const infoMessages = [{
            status: 'ERROR',
            header: translatedHeader,
            content: error.message,
        }, ];

        api.setState('infoMessages', infoMessages);
    }
}
