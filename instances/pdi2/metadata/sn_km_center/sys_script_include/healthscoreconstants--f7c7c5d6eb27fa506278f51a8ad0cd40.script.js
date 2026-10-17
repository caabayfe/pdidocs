/**
 * HealthScoreConstants - Defines constants used for knowledge base health score calculations and display.
 * Contains gauge formatting settings, color mappings, and score range thresholds.
 * @class HealthScoreConstants
 */
var HealthScoreConstants = Class.create();
HealthScoreConstants.prototype = {
    type: 'HealthScoreConstants'
};

/** @constant {number} HOMEPAGE_GAUGE_PRECISION - Decimal precision for gauge display */
HealthScoreConstants.HOMEPAGE_GAUGE_PRECISION = 0;

/** @constant {string} HOMEPAGE_GAUGE_UNIT_FORMAT - Format string for gauge unit display */
HealthScoreConstants.HOMEPAGE_GAUGE_UNIT_FORMAT = "{0}";

/** @constant {string} DATA_SOURCE_TYPE - Data source type for gauge metadata */
HealthScoreConstants.DATA_SOURCE_TYPE = "table";

/** @constant {number} DEFAULT_KB_HEALTH_SCORE - Default knowledge base health score value */
HealthScoreConstants.DEFAULT_KB_HEALTH_SCORE = 73;

/** @constant {number} EXCLUDED_SCORE - Sentinel score meaning the article/KB has no eligible data (excluded from all active AO jobs) */
HealthScoreConstants.EXCLUDED_SCORE = -1;

/** @constant {string} COLOR_CRITICAL - Color code for critical/severe health scores (0-25) */
HealthScoreConstants.COLOR_CRITICAL = 'critical';

/** @constant {string} COLOR_HIGH - Color code for poor health scores (26-50) */
HealthScoreConstants.COLOR_HIGH = "high";

/** @constant {string} COLOR_WARNING - Color code for fair health scores (51-75) */
HealthScoreConstants.COLOR_WARNING = "warning";

/** @constant {string} COLOR_POSITIVE - Color code for good health scores (76-100) */
HealthScoreConstants.COLOR_POSITIVE = "positive";

HealthScoreConstants.COLOR_GREEN_YELLOW = "green-yellow";

HealthScoreConstants.COLOR_GREEN = "green";

HealthScoreConstants.COLOR_VARIANT_PRIMARY = "primary";

HealthScoreConstants.COLOR_VARIANT_SECONDARY = "secondary";

HealthScoreConstants.COLOR_VARIANT_TERTIARY = "tertiary";

/** @constant {number} SCORE_SEVERE_MIN - Minimum value for severe health score range */
HealthScoreConstants.SCORE_SEVERE_MIN = 0;

/** @constant {number} SCORE_SEVERE_MAX - Maximum value for severe health score range */
HealthScoreConstants.SCORE_SEVERE_MAX = 25;

/** @constant {number} SCORE_POOR_MIN - Minimum value for poor health score range */
HealthScoreConstants.SCORE_POOR_MIN = 26;

/** @constant {number} SCORE_POOR_MAX - Maximum value for poor health score range */
HealthScoreConstants.SCORE_POOR_MAX = 50;

/** @constant {number} SCORE_FAIR_MIN - Minimum value for fair health score range */
HealthScoreConstants.SCORE_FAIR_MIN = 51;

/** @constant {number} SCORE_FAIR_MAX - Maximum value for fair health score range */
HealthScoreConstants.SCORE_FAIR_MAX = 75;

/** @constant {number} SCORE_GOOD_MIN - Minimum value for good health score range */
HealthScoreConstants.SCORE_GOOD_MIN = 76;

/** @constant {number} DEFAULT_KB_SPECIFIC_HEALTH_SCORE - Default health score for a specific knowledge base */
HealthScoreConstants.DEFAULT_KB_SPECIFIC_HEALTH_SCORE = 32;

/** @constant {number} DEFAULT_KB_CONSUMER_SERVICE_HEALTHSCORE - Default health score for consumer service knowledge base */
HealthScoreConstants.DEFAULT_KB_CONSUMER_SERVICE_HEALTHSCORE = 56;

/** @constant {number} PERFECT_HEALTH_SCORE - Health score returned when no records exist */
HealthScoreConstants.PERFECT_HEALTH_SCORE = 100;

/** @constant {number} TOP_SCANS_DISPLAY_LIMIT - Maximum number of top scan issues to display */
HealthScoreConstants.TOP_SCANS_DISPLAY_LIMIT = 6;

/** @constant {string} ALL_KB_KEY - Key used to represent the aggregated "All" knowledge bases entry */
HealthScoreConstants.ALL_KB_KEY = 'All';

/** @constant {string} TOP_SCANS_KEY - Key used to store top scan names in issue maps */
HealthScoreConstants.TOP_SCANS_KEY = 'topScans';

/** @constant {string} TABLE_KB_HEALTH_SCORE_RESULT - Table name for knowledge base health score results */
HealthScoreConstants.TABLE_KB_HEALTH_SCORE_RESULT = 'kb_health_score_result';

/** @constant {string} TABLE_KB_ASSIST_SCAN_RESULT - Table name for article assist scan results */
HealthScoreConstants.TABLE_KB_ASSIST_SCAN_RESULT = 'kb_assist_scan_result';

/** @constant {string} TABLE_KB_ASSIST_SCAN_DEFINITION - Table name for article assist scan definitions */
HealthScoreConstants.TABLE_KB_ASSIST_SCAN_DEFINITION = 'kb_assist_scan_definition';

/** @constant {string} SCAN_RESULT_OPEN_STATE_QUERY - Encoded query to filter open scan results */
HealthScoreConstants.SCAN_RESULT_OPEN_STATE_QUERY = 'state=open';

/** @constant {string} TABLE_KB_ASSIST_JOB_M2M_SCAN - Table name for the many-to-many relationship between AO jobs and scan definitions */
HealthScoreConstants.TABLE_KB_ASSIST_JOB_M2M_SCAN = 'kb_assist_job_m2m_scan';

/** @constant {string} FIELD_M2M_SCAN_DEFINITION - Field name on kb_assist_job_m2m_scan that references the scan definition */
HealthScoreConstants.FIELD_M2M_SCAN_DEFINITION = 'scan_definition';

/** @constant {number} DEFAULT_AUTOFIX_CONFIDENCE_THRESHOLD - Default confidence score threshold for autofix eligibility */
HealthScoreConstants.DEFAULT_AUTOFIX_CONFIDENCE_THRESHOLD = 80;
