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

    const kpiMetaData = api.data.pa_new_model_kpi_config_1.output.data.GlideKpiConfig_Query.kpiConfigDetail;
    const scoreDate = api.context.props.scoreDate;

    const frequency = kpiMetaData.calendarFrequency.label;
    const lastScoreDate = kpiMetaData.scoreEndDate ?
        kpiMetaData.scoreEndDate.substring(0, 10) : null; // Extract first 10 characters for the date
    const firstScoreDate = kpiMetaData.scoreStartDate ?
        kpiMetaData.scoreStartDate.substring(0, 10) : null; // Extract first 10 characters for the date

    // Get the selectedDate
    // By default, initial value should be scoreDate (from page props) or last score date of KPI
    const selectedDate = scoreDate ? scoreDate : lastScoreDate;

    // Calculating the values for the datepicker in KPI Summary
    const selectedDateStartTimeISO = new Date(selectedDate).toISOString();
    const eDate = new Date(selectedDate);
    eDate.setDate(eDate.getDate() + 1);
    const selectedDateEndTimeISO = eDate.toISOString();

    let datePickerConfig = {};
    let offsetDays = 180;
    const selectedDateRangeEnd = selectedDate;
    let endRangeDate = new Date(selectedDateRangeEnd);

    switch (frequency.toLowerCase()) {
        case 'daily':
            datePickerConfig = {
                format: 'MMM DD YYYY',
                viewType: 'standard',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_DAY);
            break;
        case 'weekly':
        case '4-weeks':
        case 'bi-weekly':
            datePickerConfig = {
                format: '[W]WW YYYY',
                viewType: 'weekly',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_WEEK);
            break;
        case 'monthly':
        case 'bi-monthly':
        case '6-months':
            datePickerConfig = {
                format: 'MMM YYYY',
                viewType: 'monthly',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_MONTH);
            break;
        case 'yearly':
        case 'fiscal yearly':
            datePickerConfig = {
                format: 'YYYY',
                viewType: 'yearly',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_YEAR);
            offsetDays = 366;
            break;
        case 'quarterly':
        case 'fiscal quarterly':
            datePickerConfig = {
                format: '[Q]Q YYYY',
                viewType: 'quarterly',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_QUARTER);
            break;
        default:
            datePickerConfig = {
                format: 'MMM DD YYYY',
                viewType: 'standard',
            };
            endRangeDate.setDate(endRangeDate.getDate() + ONE_DAY);
    }
     /**
     * Calculate default start/end dates to show in the date range picker
     */
    const selectedDateRangeEndISO = endRangeDate.toISOString();

    let startRangeDate = new Date(selectedDateRangeEnd);
    startRangeDate.setDate(startRangeDate.getDate() - offsetDays);

    if (startRangeDate < new Date(firstScoreDate))
        startRangeDate = new Date(firstScoreDate);

    const selectedDateRangeStartISO = startRangeDate.toISOString();
    const selectedDateRangeStart = selectedDateRangeStartISO.substring(0, 10);


    const disabledDates = [{
        "before": firstScoreDate
    }, {
        "after": lastScoreDate
    }];

    api.setState(
        "datePickerConfig", { ...datePickerConfig,
            selectedDate,
            selectedDateStartTimeISO,
            selectedDateEndTimeISO,
            disabledDates,
            selectedDateRangeStart,
            selectedDateRangeEnd,
            selectedDateRangeStartISO,
            selectedDateRangeEndISO
        }
    );
}
