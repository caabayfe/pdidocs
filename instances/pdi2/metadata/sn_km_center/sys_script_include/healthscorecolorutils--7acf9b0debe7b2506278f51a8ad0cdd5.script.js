/**
 * HealthScoreColorUtils - Utility class for mapping health scores to display colors.
 * Provides color codes based on score severity thresholds.
 * @class HealthScoreColorUtils
 */
var HealthScoreColorUtils = Class.create();
HealthScoreColorUtils.prototype = {
    initialize: function() {},

    /**
     * Maps a health score to its corresponding color code.
     * Score ranges: Severe (0-25) -> critical, Poor (26-50) -> high,
     * Fair (51-75) -> warning, Good (76-100) -> positive.
     * @param {number} score - The health score value (expected 0-100)
     * @returns {string} The color code corresponding to the score range
     */
    getHealthScoreColor: function(score) {
        if (score === HealthScoreConstants.EXCLUDED_SCORE || score === null) {
            gs.debug('SN_KM_CENTER: HealthScoreColorUtils.getHealthScoreColor() received the excluded-score sentinel or no score yet. No color to display.');
            return null;
        }
        if (score >= HealthScoreConstants.SCORE_SEVERE_MIN && score <= HealthScoreConstants.SCORE_SEVERE_MAX) {
            return HealthScoreConstants.COLOR_CRITICAL;
        } else if (score >= HealthScoreConstants.SCORE_POOR_MIN && score <= HealthScoreConstants.SCORE_POOR_MAX) {
            return HealthScoreConstants.COLOR_HIGH;
        } else if (score >= HealthScoreConstants.SCORE_FAIR_MIN && score <= HealthScoreConstants.SCORE_FAIR_MAX) {
            return HealthScoreConstants.COLOR_WARNING;
        } else if (score >= HealthScoreConstants.SCORE_GOOD_MIN && score <= HealthScoreConstants.PERFECT_HEALTH_SCORE) {
            return HealthScoreConstants.COLOR_POSITIVE;
        }
		gs.warn('SN_KM_CENTER: HealthScoreColorUtils.getHealthScoreColor() received an invalid score value: ' + score + '. Expected a value between 0 and 100. Defaulting to POSITIVE.');
        return HealthScoreConstants.COLOR_POSITIVE;
    },

	getHealthScoreColorForList: function(score) {

		var colorValue = HealthScoreConstants.COLOR_POSITIVE;
		var variantValue = HealthScoreConstants.COLOR_VARIANT_PRIMARY;

		if (score === HealthScoreConstants.EXCLUDED_SCORE || score === null) {
			gs.debug('SN_KM_CENTER: HealthScoreColorUtils.getHealthScoreColorForList() received the excluded-score sentinel or no score yet. No color to display.');
			return {
				color: null,
				variant: null
			};
		}

		if (score >= HealthScoreConstants.SCORE_SEVERE_MIN && score <= HealthScoreConstants.SCORE_SEVERE_MAX) {
			colorValue = HealthScoreConstants.COLOR_CRITICAL;
			variantValue = HealthScoreConstants.COLOR_VARIANT_PRIMARY;
		} else if (score >= HealthScoreConstants.SCORE_POOR_MIN && score <= HealthScoreConstants.SCORE_POOR_MAX) {
			colorValue = HealthScoreConstants.COLOR_HIGH;
			variantValue = HealthScoreConstants.COLOR_VARIANT_PRIMARY;
		} else if (score >= HealthScoreConstants.SCORE_FAIR_MIN && score <= HealthScoreConstants.SCORE_FAIR_MAX) {
			colorValue = HealthScoreConstants.COLOR_GREEN_YELLOW;
			variantValue = HealthScoreConstants.COLOR_VARIANT_PRIMARY;
		} else if (score >= HealthScoreConstants.SCORE_GOOD_MIN && score <= HealthScoreConstants.PERFECT_HEALTH_SCORE) {
			colorValue = HealthScoreConstants.COLOR_GREEN;
			variantValue = HealthScoreConstants.COLOR_VARIANT_PRIMARY;
		} else {
			gs.warn('SN_KM_CENTER: HealthScoreColorUtils.getHealthScoreColorForList() received an invalid score value: ' + score + '. Expected a value between 0 and 100. Defaulting to POSITIVE.');
		}
		return {
			color: colorValue,
			variant: variantValue
		};
	},

    type: 'HealthScoreColorUtils'
};
