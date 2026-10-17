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
        dotWalkMetadata,
        steps
    } = api.state;

    let {
        choices,
        comparisonId,
        tableName,
        stepNo
    } = output;

    const currentStep = steps.find(step => step.stepNo === stepNo);
    const {
        comparisonModel
    } = currentStep;

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
                const updatedDotWalkMetadata = updateDotWalkMetadata(tableName, choices, dotWalkMetadata, 'choice_single_select');
                api.setState('dotWalkMetadata', updatedDotWalkMetadata);
                return;
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
                updateStepsState(updatedComparisonModel);
                api.setState('dotWalkMetadata', updatedDotWalkMetadata);
                break;
            }

        default:
            {
                const updatedComparisonModel = updateChoiceEditorOptions(comparisonId, comparisonModel, choices);
                updateStepsState(updatedComparisonModel);
            }
    }

    function updateStepsState(updatedComparisonModel) {
        const stepsCopy = [...steps];
        const updatedStep = {
            ...currentStep
        };
        updatedStep.comparisonModel = updatedComparisonModel;
        stepsCopy[stepNo - 1] = updatedStep;
        api.setState('steps', stepsCopy);
    }
}
