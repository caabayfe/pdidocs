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
    const selectedElements = event.payload.selectedElements;
    const appliedConditions = Object.entries(selectedElements)
        .map(([key, value]) => ({
            operator: {
                id: "default",
                label: "is"
            },
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

    api.setState("appliedConditions", appliedConditions);
}
