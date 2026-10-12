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
    if (event.elementId == "get_choice_category") {
        let findingCategoryValues = api.data.get_choice_category.output.data.GlideChoiceColumn_Query.getChoiceFields;
        findingCategoryValues = findingCategoryValues.filter(type => type.rawValue != 'null').map(type => ({
            'id': type.rawValue,
            'label': type.displayValue
        }));
        const automatedFindingForm = { ...api.state.automatedFindingForm
        };
        automatedFindingForm.category = {};
        automatedFindingForm.category.list = findingCategoryValues;
        api.setState('automatedFindingForm', automatedFindingForm);
        return;
    }
    let findingTypeValues = api.data.get_choice_type.output.data.GlideChoiceColumn_Query.getChoiceFields;
    findingTypeValues = findingTypeValues.filter(type => type.rawValue != 'null').map(type => ({
        'id': type.rawValue,
        'label': type.displayValue
    }));
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    automatedFindingForm.type.list = findingTypeValues;
    let patternName = api.state.findingTypesMap[api.context.props.patternName];
    if(patternName){
    const selectedType = findingTypeValues.find((type) => type.id == patternName);
    automatedFindingForm.type.value = selectedType ? selectedType.id : '';
    automatedFindingForm.type.label = selectedType ? selectedType?.label : '';
    }
    api.setState('automatedFindingForm', automatedFindingForm);
}
