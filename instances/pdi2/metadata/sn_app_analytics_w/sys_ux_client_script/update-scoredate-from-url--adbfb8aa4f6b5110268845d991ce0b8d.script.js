/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //handle score date

    const selectedDate = api.context.props.scoreDate;
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);

    const selectedDateEndTimeISO = date.toISOString();
    const selectedDateRangeEnd = selectedDate;
    const selectedDateRangeEndISO = date.toISOString();
    const datePickerConfig = api.state.datePickerConfig;
    api.setState(
        "datePickerConfig", { ...datePickerConfig,
            selectedDate,
            selectedDateEndTimeISO,
            selectedDateRangeEnd,
            selectedDateRangeEndISO,
        }
    );
}
