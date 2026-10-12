function onOK() {
    var sourcePerfRunId = "${sysparm_source_run}";
    var targetPerfRunId = gel('reference-picker').value;
    if (!targetPerfRunId) {
        var errMsgEl = $j("#err_message");
        errMsgEl.html("${gs.getMessage('ATF:select_perf_run_record_error')}");
        errMsgEl.css("display", "block");
        return false;
    }

    var ga = new GlideAjax('ATFPerformanceClientUtil');
    ga.addParam('sysparm_name', 'getOrCreateComparisonUrl');
    ga.addParam('sysparm_run_1', targetPerfRunId);
    ga.addParam('sysparm_run_2', sourcePerfRunId);
    ga.getXMLAnswer(function(response) {
        response = JSON.parse(response);
        if (response.error) {
            var errMsgEl = $j("#err_message");
            errMsgEl.html(response.error);
            errMsgEl.css("display", "block");
            return false;
        } else {
            window.location.href = response.link;
        }
    });
}

function clearErr() {
    var errMsgEl = $j("#err_message");
    errMsgEl.html("");
    errMsgEl.css("display", "none");
}
