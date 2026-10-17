/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    /* Persist the dates in the state variables before going on to fetch the dates from PA Job log table */
    const defaultDates = api.data.vsc_default_dates_of_hardening_comparisons.output;
    if (defaultDates && defaultDates.date1 && defaultDates.date2 && defaultDates.date1Display && defaultDates.date2Display) {
        api.setState('defaultFirstDate', defaultDates.date1Display);
        api.setState('defaultSecondDate', defaultDates.date2Display);
    }
}
