/**
 * Data broker to execute subscription recommendations
 * @param {object} input - contains an object with a recommendation table name and sys_ids of
 * recommendation records in the table that should be executed
 * @return {boolean}
 */
function transform(input) {
    try {
        if (!input.recommendationObj.table || !input.recommendationObj.recommendationIds) {
            const errorMessage = "Invalid recommendation input data";
            throw new Error(errorMessage);
        }

        if (input.recommendationObj.recommendationIds.length === 0)
            return 'success';

        return new ExecuteIssuesTabRecommendations(input).applyRecommendations();
    } catch (e) {
        gs.warn(gs.getMessage("Subscription Management: {0}", e.message));
        return 'failure';
    }
}
