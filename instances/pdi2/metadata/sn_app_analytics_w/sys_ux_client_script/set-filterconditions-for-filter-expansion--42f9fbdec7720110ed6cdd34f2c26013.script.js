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
    if (event.payload.isElementsInitialized)
        return;

    const selectedElements = api.state.selectedElements;
    const selectedFilterId = event.payload.filterId;
    api.setState('apiStatus', {});
    /**
     * selectedElement Format - 
     * {
            "1f918835d7231100b96d45a3ce6103fe": [
                "7a74dfc1f5a20110ab19dfad0086a477"
            ]
        }
     * appliedConditions required format - 
     * appliedConditions = [
        {
          "selectedDimension": { "id": "priority" },
          "selectedDimensionValues": [{ "id": "1" }]
        }
      ]
     */
    const appliedConditions = Object.entries(selectedElements)
        .filter(([key, value]) => selectedFilterId != key)
        .map(([key, value]) => ({
            selectedDimension: {
                id: key
            },
            selectedDimensionValues: value.map((val) => {
                var isEmptyValue = /empty_*/g.test(val);
                return {
                    id: isEmptyValue ? '' : val
                };
            })
        }));

    if (Array.isArray(appliedConditions))
        api.setState('filterConditions', appliedConditions);
}
