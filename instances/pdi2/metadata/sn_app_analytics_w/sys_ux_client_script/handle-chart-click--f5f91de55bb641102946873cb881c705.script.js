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
    const selectedDate = event.payload.params.scoreDate;
    const date = new Date(selectedDate);
    const selectedDateStartTimeISO = date.toISOString();
    date.setDate(date.getDate() + 1);

    const selectedDateEndTimeISO = date.toISOString();
    const datePickerConfig = api.state.datePickerConfig;
    api.setState(
        "datePickerConfig", { ...datePickerConfig,
            selectedDate,
            selectedDateStartTimeISO,
            selectedDateEndTimeISO
        }
    );

    const selectedFilter = api.state.selectedFilterWithoutInitializationContext;
    const selectedElements = api.state.selectedElements;

    // Recalculating the filterConditions
    const appliedConditions = Object.entries(selectedElements)
        .filter(([key, value]) => selectedFilter != key)
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

    api.setState('filterSelected', selectedFilter);
    api.setState('filterConditions', appliedConditions);
}
