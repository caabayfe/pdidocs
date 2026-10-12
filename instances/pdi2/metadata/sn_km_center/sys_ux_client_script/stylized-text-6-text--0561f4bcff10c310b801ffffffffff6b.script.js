/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const DATA_RESOURCE_KEY = 'fetch_knowledgebase_issues_1';
    const STATE_KB_KEY = 'knowledgeBase';
    const TOP_SCANS_KEY = 'topScans';
    const NUMBER_OF_ARTICLES_KEY = 'numberOfArticles';
    const SCAN_INDEX = 3;

    var dataResource = api.data[DATA_RESOURCE_KEY];
    var knowledgeBase = api.state[STATE_KB_KEY];

    if (!dataResource || !dataResource.output || !knowledgeBase) return '';

    var kbData = dataResource.output[knowledgeBase];
    // If KB doesn't exist, return 0
    if (!kbData) {
        return helpers.translateSync('Articles affected ({0})', 0);
    }
    if (!kbData[TOP_SCANS_KEY] || kbData[TOP_SCANS_KEY].length < SCAN_INDEX + 1) return '';
    var topScanName = kbData[TOP_SCANS_KEY][SCAN_INDEX];
    var scanData = kbData[topScanName];
    var count = scanData ? scanData[NUMBER_OF_ARTICLES_KEY] : 0;

    return helpers.translateSync('Articles affected ({0})', count);
}
