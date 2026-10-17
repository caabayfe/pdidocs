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
    const dataPrefix = api.data[event.elementId];
    const models = {};
    const chgModels = dataPrefix.output.result.chg_model;
    models.chgModels = chgModels;
    models.pinned = dataPrefix.output.result.__pinned;
    models.totalCards = dataPrefix.output.result.__totalRecords;
    models.pinLabels = dataPrefix.output.result.__pinLabels;
    api.setState('models', models);

    // Reset selected card if it is no longer visible
    if (api.state.selectedCard) {
        const selectedCardNotVisible = chgModels.filter((
            {sysId}) => sysId === api.state.selectedCard?.value?.sysId
        ).length === 0;

        if (selectedCardNotVisible) {
            api.setState('selectedCard', null);

            const dropdownVals = api.state.dropdownValues;
            // Reset dropdown values
            if (api.state.dropdownValues) {
                const editIndex = dropdownVals.findIndex(({id}) => id === 'edit');
                const proposeIndex = dropdownVals.findIndex(({id}) => id === 'propose');
                const createIndex = dropdownVals.findIndex(({id}) => id === 'create');

                const noCardDroptown = JSON.parse(JSON.stringify(dropdownVals));
                noCardDroptown[proposeIndex].disabled = false;
                noCardDroptown[createIndex].disabled = true;
                noCardDroptown[editIndex].label = noCardDroptown[editIndex].templateLabel;
                noCardDroptown[editIndex].disabled = true;

                api.setState('dropdownValues', noCardDroptown);
            }
        }
    }
}
