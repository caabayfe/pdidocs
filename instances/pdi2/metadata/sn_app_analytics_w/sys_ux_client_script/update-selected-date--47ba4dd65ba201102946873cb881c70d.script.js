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
    const ONE_DAY = 1;
    const ONE_WEEK = 7;
    const ONE_MONTH = 31;
    const ONE_QUARTER = 93;
    const ONE_YEAR = 366;

    const datePickerConfig = api.state.datePickerConfig;
    let selectedDate = event.payload.formattedValue;

    // For non-daily, the selectedDate will be the first date of the period.
    // The firstScoreDate in NAM can be any date in the week.
    // So for example, if a week starts at 19th April but firstScoreDate is at 20th April, it can lead to some weird behavior in the chart if
    // we don't do following check
    const firstScoreDateString = api.state.kpiMetaData.scoreStartDate.substr(0,10);
    if (new Date(selectedDate) < new Date(firstScoreDateString))
        selectedDate = firstScoreDateString;

    // Adjust selected date and selectedStartDateISO and selectedEndDateISO for score summary
    const selectedDateStartTimeISO = new Date(selectedDate).toISOString();
    const eDate = new Date(selectedDate);
    eDate.setDate(eDate.getDate() + 1);
    const selectedDateEndTimeISO = eDate.toISOString();

    // calculate the date range window size
    const previousDateRangeStart = new Date(datePickerConfig.selectedDateRangeStart);
    const previousDateRangeEnd = new Date(datePickerConfig.selectedDateRangeEnd);
    const datesDiff = previousDateRangeEnd.getTime() - previousDateRangeStart.getTime();

    // Adjust the range picker's start date to (end - previous range size)
    const selectedRangeStart = new Date(selectedDate);
    selectedRangeStart.setTime(selectedRangeStart.getTime() - datesDiff);
    let selectedDateRangeStart = selectedRangeStart.toISOString().substr(0, 10);
    
    if (selectedRangeStart < new Date(firstScoreDateString))
        selectedDateRangeStart = firstScoreDateString;

    const selectedDateRangeStartISO = new Date(selectedDateRangeStart).toISOString();

    // Adjust date range picker's end date to date selected in date picker
    const frequency = api.state.kpiMetaData.calendarFrequency.label;
    const selectedDateRangeEnd = selectedDate;

    const selectedDateRangeEndObj = new Date(selectedDateRangeEnd);
    switch (frequency.toLowerCase()) {
        case 'daily':
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_DAY);
            break;
        case 'weekly':
        case '4-weeks':
        case 'bi-weekly':
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_WEEK);
            break;
        case 'monthly':
        case 'bi-monthly':
        case '6-months':
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_MONTH);
            break;
        case 'yearly':
        case 'fiscal yearly':
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_YEAR);
            break;
        case 'quarterly':
        case 'fiscal quarterly':
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_QUARTER);
            break;
        default:
            selectedDateRangeEndObj.setDate(selectedDateRangeEndObj.getDate() + ONE_DAY);
    }

    const selectedDateRangeEndISO = selectedDateRangeEndObj.toISOString();

    if (selectedDate != null) {
        api.setState(
            "datePickerConfig", { ...datePickerConfig,
                selectedDate,
                selectedDateStartTimeISO,
                selectedDateEndTimeISO,
                selectedDateRangeStart,
                selectedDateRangeEnd,
                selectedDateRangeStartISO,
                selectedDateRangeEndISO
            }
        );
    }

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
    api.setState('resetFilterElements', !api.state.resetFilterElements);
}
