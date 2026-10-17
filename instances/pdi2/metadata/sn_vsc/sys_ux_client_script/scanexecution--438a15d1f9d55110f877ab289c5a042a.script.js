/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var progressId = "";
    if(api.context.props.table == "scan_check_suite"){
        progressId = api.data.vsc_execute_scan_1.output;
    } else{
        progressId = api.data.vsc_execute_test_check_scan_1.output;
    }
    
    let progressTimerId = null;

    function getProgress() {
        var progId = progressId;
        const url = `/api/sn_cicd/progress/${progId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        helpers.snHttp(url, {
            method: 'GET',
            headers
        }).then(res => {
            const {
                status_label,
                status_message,
                status_detail,
                error,
                percent_complete,
                links
            } = res.response.result;
            var scanStatus = percent_complete === 100 && status_label == 'Successful' ? 'Succeeded 100%' : 'Running';
            api.setState('status', scanStatus);
            api.setState('progressPercentage', percent_complete);
            api.setState('statusMessage', status_message);

            if (percent_complete === 100) {
                helpers.timing.clearInterval(progressTimerId);
            }
        });
    }

    if (progressId) {
        progressTimerId = helpers.timing.setInterval(getProgress, 500);
    }

}
