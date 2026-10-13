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
    switch (event.name) {
        case 'NOW_DROPDOWN#ITEM_CLICKED':
            {
                const filterId = event.payload.item.id;
                const {listType} = api.context.props;
                api.setState('selectedFilterId', filterId);
                api.setState('isFilterLoading', true);
                api.data.load_filter.execute({
                    filterId,
                    listType
                });
                break;
            }

        case 'DATA_OP_SUCCEEDED':
            {
                const comparisonModel = event.payload.data.output;
                if (comparisonModel.length) {
                    api.setState('comparisonModel', comparisonModel);
                    api.setState('cleanComparisonModelCopy', comparisonModel);
                }
                api.setState('isFilterLoading', false);
                break;
            }
    }
}
