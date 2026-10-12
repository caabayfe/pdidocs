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
    const fields = event.payload.data.output.data.snPo.GlidePromin.getFieldsLabel.fields;
    const {
        view: currentView
    } = api.state.currentView;
    const {
        VIEWS
    } = api.state;
        
    if(currentView ==  VIEWS.ACTIVITIES_LIST || currentView == VIEWS.ACTIVITY_FORM){
        const map = {};
        fields.forEach(field => map[field.id] = field.label);
        const recommendedFields = api.state.activityRecommendations.map(field => ({
            ...field,
            label: map[field.fieldName],
            'selected': false
        }));
        api.setState('filteredActivityRecommendations', recommendedFields);
        return;
    }
    const recommendedFields = fields.map(field => ({
        id: field.id,
        label: field.label,
        'selected': false
    }));
    api.setState('classificationFields', recommendedFields);
}
