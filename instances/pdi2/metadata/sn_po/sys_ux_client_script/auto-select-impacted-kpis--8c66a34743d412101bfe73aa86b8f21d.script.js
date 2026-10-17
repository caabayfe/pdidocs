/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const categoryKPIsMap = {...api.state.categoryKPIsMap};
    const automatedFindingForm = {...api.state.automatedFindingForm};

    // If no items in category KPI map, do nothing
    if (Object.keys(categoryKPIsMap)?.length === 0) {
        return;
    }

    // Check if KPIs are configured for selected category in process config
    if (!(event.payload.value in categoryKPIsMap)) {
        // Reset KPIs if config for category is not found
        automatedFindingForm.impacted_kpi.selectedItems = [];
        automatedFindingForm.impacted_kpi.messages = [];
        api.setState('automatedFindingForm', automatedFindingForm);
        return;
    }

    const selectedCategoryKPIs = categoryKPIsMap[event.payload.value];

    if (!Array.isArray(selectedCategoryKPIs.impactedKpis) || selectedCategoryKPIs.impactedKpis.length === 0) {
        automatedFindingForm.impacted_kpi.selectedItems = [];
        automatedFindingForm.impacted_kpi.messages = [];
        api.setState('automatedFindingForm', automatedFindingForm);
        return;
    }

    automatedFindingForm.impacted_kpi.selectedItems = selectedCategoryKPIs.impactedKpis;

    const selectedCategory = automatedFindingForm.category.list.find(category => category.id === event.payload.value);
    const selectedCategoryLabel = selectedCategory?.label || event.payload.value;
    automatedFindingForm.impacted_kpi.messages = [{
        icon: 'info-circle-outline',
        status: 'info',
        content: await helpers.translate('Automatically selected based on KPI-category mapping for "{0}" in Process Configuration', selectedCategoryLabel),
    }];

    api.setState('automatedFindingForm', automatedFindingForm);
}
