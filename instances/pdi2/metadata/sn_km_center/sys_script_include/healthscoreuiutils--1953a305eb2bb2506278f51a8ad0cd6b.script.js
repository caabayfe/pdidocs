/**
 * HealthScoreUIUtils - Utility class for preparing health score data for UI components.
 * Formats health score data for gauge visualization in the Knowledge Center homepage.
 * @class HealthScoreUIUtils
 */
var HealthScoreUIUtils = Class.create();
HealthScoreUIUtils.prototype = {
    initialize: function() {},

    /**
     * Prepares gauge data for displaying health score in the UI.
     * Formats the score into the standard format required by gauge components.
     * @param {number} kbScore - The knowledge base health score value
     * @returns {Object} Formatted gauge data object with standardFormatData array
     */
    getGaugeData: function(kbScore) {
        var healthScore = 0;
        healthScore = (kbScore === null || kbScore === undefined || isNaN(kbScore) || kbScore === HealthScoreConstants.EXCLUDED_SCORE) ? 0 : kbScore;
        var result = {
            standardFormatData: [{
                "metadata": {
                    "format": {
                        "precision": HealthScoreConstants.HOMEPAGE_GAUGE_PRECISION,
                        "unitFormat": HealthScoreConstants.HOMEPAGE_GAUGE_UNIT_FORMAT
                    },
                    "dataSourceType": HealthScoreConstants.DATA_SOURCE_TYPE
                },
                "data": [{
                    "value": healthScore
                }]
            }]
        };
		return result;
    },

    type: 'HealthScoreUIUtils'
};
