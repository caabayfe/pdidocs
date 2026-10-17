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
    const {
        elementId
    } = event;
    refreshScoresByTypeAndMetric();

    function refreshScoresByTypeAndMetric() {
        switch (api.state.selectedType) {
            case "class":
                refreshClassScoresByMetric();
                break;
            case "group":
                refreshGroupScoresByMetric();
                break;
            case "service":
                refreshServiceScoresByMetric();
                break;
        }
    }

    function refreshClassScoresByMetric() {
        switch (elementId) {
            case "completeness_refresh":
                api.data.get_class_completeness_score.refresh();
                break;
            case "correctness_refresh":
                api.data.get_class_correctness_score.refresh();
                break;
            case "compliance_refresh":
                api.data.get_class_compliance_score.refresh();
                break;
        }
    }

    function refreshGroupScoresByMetric() {
        switch (elementId) {
            case "completeness_refresh":
                api.data.get_group_completeness_score.refresh();
                break;
            case "correctness_refresh":
                api.data.get_group_correctness_score.refresh();
                break;
            case "compliance_refresh":
                api.data.get_group_compliance_score.refresh();
                break;
        }
    }

    function refreshServiceScoresByMetric() {
        switch (elementId) {
            case "completeness_refresh":
                api.data.get_service_completeness_score.refresh();
                break;
            case "correctness_refresh":
                api.data.get_service_correctness_score.refresh();
                break;
            case "compliance_refresh":
                api.data.get_service_compliance_score.refresh();
                break;
        }
    }
}
