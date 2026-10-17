/**
 * All components eventually call this client script,
 *
 * User to set selected options to create encoded query 
 * to fetch Hermes Usage metrics table
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
    let selectedFilterArgs = {
        selectedTopic: api.state.topicSelected,
        selectedApp: api.state.appIdSelected,
        selectedService: api.state.serviceIdSelected,
        selectedDate: api.state.dateRangeSelected,
        selectedSourceType: api.state.sourceTypeSelected
    };
    checkDateRangeAnsEmitAlert();
    setClientStates();

    /***
    * If selected date range is greater than 60 days, emit info message
    */
    function checkDateRangeAnsEmitAlert() {
        const {
            getNotificationTemplate,
            getDateDiffInDays
        } = imports["global.HermesUsageMetricsUtil"]();
        let startDateStr = api.state.dateRangeSelected?.item?.start;
        let endDateStr = api.state.dateRangeSelected?.item?.end;
        let infoMessage = "Date range selection greater than 60 days will filter data based on monthly rolled-up values";
        let daysDifference = getDateDiffInDays({startDateStr, endDateStr});
        if (daysDifference > 60) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", getNotificationTemplate({infoMessage}));
        }
    }

    function setClientStates() {
        api.setState("backendFetchArgs", selectedFilterArgs);
    }
}
