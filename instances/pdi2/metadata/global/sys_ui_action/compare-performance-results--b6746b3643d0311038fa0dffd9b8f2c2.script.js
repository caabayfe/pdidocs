function navigateToComparison() {
    var checked = g_list.getChecked();
    if (!checked) {
        getMessage("ATF:select_perf_run_record_error_list", function(msg) {
            alert(msg);
        });
        return;
    }

    checked = checked.split(",");
    if (checked.length !== 2) {
        getMessage("ATF:select_perf_run_record_error_list", function(msg) {
            alert(msg);
        });
        return;
    }

    var ga = new GlideAjax('ATFPerformanceClientUtil');
    ga.addParam('sysparm_name', 'getOrCreateComparisonUrl');
    ga.addParam('sysparm_run_1', checked[0]);
    ga.addParam('sysparm_run_2', checked[1]);
    ga.getXMLAnswer(function(response) {
        response = JSON.parse(response);
        if (response.error)
            alert(response.error);
        else
            window.location.href = response.link;
    });
}
