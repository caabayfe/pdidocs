/**
 * Triggered on page ready
 * 
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
    const {
        DEFAULT_MONTHS_AGO
    } = imports["global.HermesUsageMetricsUtil"]();
    let startDate = new Date();
    let endDate = new Date();
    // Set date to default motnhs ago
    startDate.setMonth(startDate.getMonth() - DEFAULT_MONTHS_AGO);
    setClientStates();

    function getDateString(date) {
        // YYYY-MM-DD
        // day and month is prepended with 0, and last 2 digits are taken
        const formattedDate = `${date.getFullYear()}-${('0'+(date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        return formattedDate;
    }

    function getSelectedDate() {
        let selectedDate = {item:{
            "name": "Hermes Usage Date range picker",
            "isoStart": startDate.toISOString(),
            "isoEnd": endDate.toISOString(),
            "start": getDateString(startDate),
            "end": getDateString(endDate),
        }};
        return selectedDate;
    }

    function setClientStates() {
        api.setState("dateRangeSelected",getSelectedDate());
    }
}
