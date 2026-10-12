/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    const DATA_RESOURCE_KEY = 'fetch_knowledgebase_issues_1';
    const STATE_KB_KEY = 'knowledgeBase';
    const TOP_SCANS_KEY = 'topScans';
    const TOTAL_ERRORS_KEY = 'totalErrors';
    const SCAN_INDEX = 0;

    var dataResource = api.data[DATA_RESOURCE_KEY];
    var knowledgeBase = api.state[STATE_KB_KEY];

    if (!dataResource || !dataResource.output || !knowledgeBase) return '';

    var kbData = dataResource.output[knowledgeBase];

    if (!kbData) {
        var allData = dataResource.output['All'];
        if (!allData || !allData[TOP_SCANS_KEY] || allData[TOP_SCANS_KEY].length < SCAN_INDEX + 1) return '';
        
        var topScanName = allData[TOP_SCANS_KEY][SCAN_INDEX];
        return topScanName + ' (' + 0 + ')';
    }

    if (!kbData[TOP_SCANS_KEY] || kbData[TOP_SCANS_KEY].length < SCAN_INDEX + 1) return '';

    var topScanName = kbData[TOP_SCANS_KEY][SCAN_INDEX];
    var scanData = kbData[topScanName];
    var score = scanData ? scanData[TOTAL_ERRORS_KEY] : 0;

    return topScanName + ' (' + score + ')';
}
