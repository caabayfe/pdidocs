/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    setLoader();

    api.emit(("MACROPONENT_TRACK_USAGE_REQUESTED"), {
        event: "Benchmark report download",
        value: {}
    });

    const {
        context,
        state,
        setState
    } = api;
    const {
        snHttp
    } = helpers;
    const indicatorScoreResponse = await snHttp('/api/sn_bm_client/benchmark_client_api/indicator_scores', {
        method: "GET",
        batch: false,
    });
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
    var sendDataResult;
    if (indicatorScoreResponse && indicatorScoreResponse.response) {
        var result = indicatorScoreResponse.response.result;
        var categoryId = (api.context.props.category) ? (api.context.props.category) : api.state.categories[0].id;
        var industry = api.state.detailsHeaderInfo.industry;
        var breakdown = {};
        breakdown.type = (api.state.selectedCohortType) ? api.state.selectedCohortType : '';
        breakdown.value = (api.state.selectedCohortID) ? api.state.selectedCohortID : '';
        var breakdowns = api.state.cohort;
        if (!breakdowns) {
            api.setState('isDownloadDisabled', false);
            setLoader(false);
            return;
        }
        var sendDataResult = await benchmarksUtils.sendData(result, categoryId, industry, breakdown, breakdowns, helpers);
    }
    if (sendDataResult) {
        sendDataResult.method = "POST";
        sendDataResult.batch = false;
        var url = '/api/sn_bm_client/benchmark_client_api/export_pdf';
        const exportPDFResult = await snHttp(url, {
            'method': "POST",
            "body": sendDataResult
        });
        api.setState('isDownloadDisabled', false);
        setLoader(false);
        if (exportPDFResult && exportPDFResult.response && exportPDFResult.response.result && exportPDFResult.response.result.attachment_id) {
            getAttachment(exportPDFResult.response.result.attachment_id, api);
        }
    } else {
        api.setState('isDownloadDisabled', false);
        setLoader(false);
    }

    async function getAttachment(attachmentId, api) {
        const uri = 'sys_attachment.do?sys_id=' + attachmentId;

        api.emit("NAV_ITEM_SELECTED", {
            "external": {
                "url": uri
            }
        });
    };

    function setLoader(loader = true) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: loader,
            label: "Downloading",
            action: null,
            nonBlocking: true
        });
    }
}
