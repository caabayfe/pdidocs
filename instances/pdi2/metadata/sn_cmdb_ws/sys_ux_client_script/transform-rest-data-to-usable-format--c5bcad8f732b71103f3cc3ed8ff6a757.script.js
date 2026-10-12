/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    // translations
    const [
        MAX_FAILURES_MESSAGE,
        INCOMPLETE_MESSAGE,
        TIME_OUT_MESSAGE,
        NOT_RUN_MESSAGE,
        IN_PROGRESS_MESSAGE,
        LAST_UPDATED,
        ERROR_MESSAGE,
        DUPLICATES,
        NOT_DUPLICATES,
        ORPHANS,
        NOT_ORPHANS,
        STALE_TRANSLATED,
        NOT_STALE
    ] = await Promise.all([
        helpers.translate('Failure threshold reached'),
        helpers.translate('Incomplete score'),
        helpers.translate('Daily timeout reached'),
        helpers.translate('Not evaluated'),
        helpers.translate('Calculating...'),
        helpers.translate('Last updated:'),
        helpers.translate('Error'),
        helpers.translate('Duplicates'),
        helpers.translate('Not duplicates'),
        helpers.translate('Orphans'),
        helpers.translate('Not orphans'),
        helpers.translate('Stale'),
        helpers.translate('Not stale')
    ]);

    // constants
    const IN_PROGRESS = 'in_progress';
    const MAX_FAILURES = 'max_failures';
    const INCOMPLETE = 'incomplete';
    const TIME_OUT = 'time_out';
    const COMPLETE = 'complete';
    const NOT_RUN = 'not_run';
    const DUPLICATE = 'REL_DUPLICATE';
    const ORPHAN = 'REL_ORPHAN';
    const STALE = 'REL_STALE';
    
    var relResults = api.data.cmdb_health__cmdb_health_rest_api.output.result;
    
    var overallResult = relResults[0];
    var lastUpdatedObject = { 'label': LAST_UPDATED + ' ' + overallResult.updated};
    api.setState('lastUpdatedOn', lastUpdatedObject);

    // Populate the scores for the submetrics
    var subMetrics = [];
    for (var i = 1; i <relResults.length; i++) {
        var metricData = relResults[i];
        var metric = {};
        
        var metricMessage = '';
        var metricStatus = metricData.status;
        var displayLink = false;
        var hasError = false;
        var link = '/api/now/v1/context_doc_url/CSHelp:';

        var failures = metricData.failed;
        var nonFailures = metricData.total - metricData.failed;
        
        var errorMessage = 'Error';
        var illustration = 'error';

        if (metricStatus == MAX_FAILURES) {
            metricMessage = MAX_FAILURES_MESSAGE;
            displayLink = true;
            hasError = true;
            link += 'configuration-management-failure-threshold-reached';
        } else if (metricStatus == INCOMPLETE) {
            metricMessage = INCOMPLETE_MESSAGE;
            displayLink = true;
            hasError = true;
            link += 'configuration-management-incomplete-score';
        } else if (metricStatus == NOT_RUN) {
            errorMessage = NOT_RUN_MESSAGE;
            hasError = true;
            illustration = 'no-data';
        } else if (metricStatus == TIME_OUT) {
            metricMessage = TIME_OUT_MESSAGE;
            hasError = true;
        } else if (metricStatus != COMPLETE) {
            errorMessage = IN_PROGRESS_MESSAGE;
            illustration = 'no-data';
            hasError = true;
        }

        metric.message = metricMessage;
        metric.score = 100 - (metricData.failed * 100 / metricData.total);
        metric.label = metricData.friendly_name;
        metric.displayLink = displayLink;
        metric.link = link;
        metric.hasError = hasError;
        metric.errorMessage = {
            "label": errorMessage,
            "level": 3
        };
        metric.illustration = illustration;

        var data = [
            {
                "data": [
                    {
                        "metric": "",
                        "value": nonFailures
                    },
                    {
                        "metric": "",
                        "value": failures
                    }
                ],
                "metadata": {
                    "groupBy": [
                        {
                        "elements": [
                        ],
                        "label": "Metric",
                        "id": "metric",
                        "fieldType": "string"
                        }
                    ],
                    "format": {
                        "unitFormat": "{0}"
                    }
                }
            }
        ];

        if (metricData.metric == DUPLICATE) {
            data[0].data[1].metric = DUPLICATES;
            data[0].data[0].metric  = NOT_DUPLICATES;
            metric.data = data;
            api.setState('duplicateData', metric);
        } else if (metricData.metric == ORPHAN) {
            data[0].data[1].metric  = ORPHANS;
            data[0].data[0].metric  = NOT_ORPHANS;
            metric.data = data;
            api.setState('orphanData', metric);
        } else {
            data[0].data[1].metric  = STALE_TRANSLATED;
            data[0].data[0].metric  = NOT_STALE;
            metric.data = data;
            api.setState('staleData', metric);
        }
    }
}
