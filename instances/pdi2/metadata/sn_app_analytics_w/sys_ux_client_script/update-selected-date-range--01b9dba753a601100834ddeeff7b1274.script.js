/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const ONE_DAY = 1;
    const ONE_WEEK = 7;
    const ONE_MONTH = 31;
    const ONE_QUARTER = 93;
    const ONE_YEAR = 366;

    const datePickerConfig = api.state.datePickerConfig;

    const selectedDateRangeStart = event.payload.formattedStartDateValue;
    const selectedDateRangeEnd = event.payload.formattedEndDateValue;
    const selectedDateRangeStartISO = new Date(selectedDateRangeStart).toISOString();
    
    // NAM Scores API excludes the end date (so adding one day to pass to viz component)
    const eDate = new Date(selectedDateRangeEnd);
    const frequency = api.state.kpiMetaData.calendarFrequency.label;

    switch (frequency.toLowerCase()) {
        case 'daily':
            eDate.setDate(eDate.getDate() + ONE_DAY);
            break;
        case 'weekly':
        case '4-weeks':
        case 'bi-weekly':
            eDate.setDate(eDate.getDate() + ONE_WEEK);
            break;
        case 'monthly':
        case 'bi-monthly':
        case '6-months':
            eDate.setDate(eDate.getDate() + ONE_MONTH);
            break;
        case 'yearly':
        case 'fiscal yearly':
            eDate.setDate(eDate.getDate() + ONE_YEAR);
            break;
        case 'quarterly':
        case 'fiscal quarterly':
            eDate.setDate(eDate.getDate() + ONE_QUARTER);
            break;
        default:
            eDate.setDate(eDate.getDate() + ONE_DAY);
    }

    const selectedDateRangeEndISO = eDate.toISOString();

    if (selectedDateRangeStart != null && selectedDateRangeEnd != null) {
        api.setState(
            "datePickerConfig", { ...datePickerConfig,
                selectedDateRangeStart,
                selectedDateRangeEnd,
                selectedDateRangeStartISO,
                selectedDateRangeEndISO
            }
        );
    }
}
