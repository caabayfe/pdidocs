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
    var progressId = api?.data?.access_finding_test_check?.output;
    let progressTimerId = null;
    let pollInterval = 1000;
    const MAX_INTERVAL = 10000;

    async function getProgress() {
        if (!progressId) return;

        const url = `/api/sn_cicd/progress/${progressId}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        try {
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

            // Schedule next poll with exponential backoff
            pollInterval = Math.min(pollInterval * 2, MAX_INTERVAL);
            progressTimerId = helpers.timing.setTimeout(getProgress, pollInterval);

        } catch (err) {
            console.error("Error polling progress API:", err);
            // Retry later with backoff
            pollInterval = Math.min(pollInterval * 2, MAX_INTERVAL);
            progressTimerId = helpers.timing.setTimeout(getProgress, pollInterval);
        }
    }

    // Start polling
    if (progressId) {
        getProgress(); // initial call
    }
}
