/**
 * Transforms health score input into gauge-compatible data format.
 * Prepares data for the health score gauge visualization component.
 * @param {Object} params - Input parameters containing the health score
 * @param {number} params.kb_health_score - The knowledge base health score value
 * @returns {Object} Object containing gaugeData formatted for gauge component
 */
function transform(params) {
	var healthScore = params.kb_health_score;
    var gaugeData = new sn_km_center.HealthScoreUIUtils().getGaugeData(healthScore);

    return {
        gaugeData: gaugeData,
    };
}
