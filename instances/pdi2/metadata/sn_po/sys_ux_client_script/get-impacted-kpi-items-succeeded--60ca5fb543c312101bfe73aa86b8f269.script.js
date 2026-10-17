/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { success, items, rowCount } = event.payload.data.output.data.snPo.GlideProminFindings.getReferenceItems;

    if (!success) {
        return;
    }

    const automatedFindingForm = { ...api.state.automatedFindingForm
    };

    const sectionLabel = await helpers.translate('Showing 1-{0} of {1}', items.length, rowCount);
    const noItemsSectionLabel = await helpers.translate('No results found');

    automatedFindingForm.impacted_kpi.list = [{
        id: 'impacted-kpi-section',
        label: Array.isArray(items) && items.length > 0 ? sectionLabel : noItemsSectionLabel,
        children: items,
    }];

    if (
        !Array.isArray(automatedFindingForm.impacted_kpi.selectedItems) ||
        automatedFindingForm.impacted_kpi.selectedItems.length === 0
    ) {
        automatedFindingForm.impacted_kpi.selectedItems = [];
        automatedFindingForm.impacted_kpi.messages = [];
    }

    api.setState('automatedFindingForm', automatedFindingForm);
}
