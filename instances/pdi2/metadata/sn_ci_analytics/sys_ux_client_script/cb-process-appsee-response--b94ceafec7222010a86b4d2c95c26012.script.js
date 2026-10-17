/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        updateDotWalkMetadata,
        updateChoiceEditorOptions,
        addChildRowWithDynamicFieldChoices
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();

    const {
        output
    } = api.data.va_condition_builder__appsee_apis_1;
    if (!output) {
        return;
    }
    const {
        fetchChoiceValuesPayload: {
            valueTransformer,
            source
        },
        comparisonModel,
        dotWalkMetadata
    } = api.state;
    let {
        choices,
        comparisonId,
        tableName
    } = output;

    if (valueTransformer) {
        choices = valueTransformer(choices);
    }

    /**
     * Appsee API's can be called from different sources. Some can be
     * metadata requests, some from custom filters and some from choice
     * editor.
     **/
    switch (source) {
        case 'dot_walk_meta_requested':
            {
                const updatedDotWalkMetadata = updateDotWalkMetadata(tableName, choices, dotWalkMetadata);
                api.setState('dotWalkMetadata', updatedDotWalkMetadata);
                break;
            }

        case 'filter_properties_clicked':
            {
                const {
                    fieldInternalValue
                } = output;
                const {
                    comparisonModel: updatedComparisonModel,
                    dotWalkMetadata: updatedDotWalkMetadata
                } = addChildRowWithDynamicFieldChoices(comparisonId, comparisonModel, fieldInternalValue, output.event_name, choices, dotWalkMetadata);
                api.setState('comparisonModel', updatedComparisonModel);
                api.setState('dotWalkMetadata', updatedDotWalkMetadata);
                api.setState('selectedFilterId', '');
                break;
            }

        default:
            {
                const updatedComparisonModel = updateChoiceEditorOptions(comparisonId, comparisonModel, choices);
                api.setState('comparisonModel', updatedComparisonModel);
                api.setState('selectedFilterId', '');
            }
    }
}
