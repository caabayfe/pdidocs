/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    console.log(api.context.props.data);

    // TODO: Refactor for re-use
    function showNotification(msg, type='info') {
        console.log(msg);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'delete-fail',
                status: type,
                icon: 'exclamation-triangle-outline',
                content: msg,
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    const {
        plugins,
        props_details,
        name,
        status,
        title,
        userXToken
    } = (api.context.props.data || {});
    
    if (status) {
        api.setState('status', status);
    }
    const headers = {
        'Content-Type': 'application/json',
        'X-UserToken': userXToken
    };
    
    if (props_details && props_details.progress_id) {
        api.setState('progressId', props_details.progress_id);
        
        showNotification('Checking Plugin Installation status...');
                    
        // pool for progress
        // Start showing progress
        let progressTimerId = null;

        // TODO: Refactor for re-use
        function getProgress() {
            console.log('Getting progress');
            const progressUrl = `/api/sn_cicd/progress/${props_details.progress_id}`;
            helpers.snHttp(progressUrl, {
                method: 'GET',
                headers
            }).then(res => {
                console.log('Progress response', res);
                const {
                    status_label,
                    status_message,
                    status_detail,
                    error,
                    percent_complete,
                    links
                } = res.response.result;
                api.setState('status', percent_complete < 100 ? 'installing' : (
                    percent_complete === 100 ? 'installed' : ''
                ));
                api.setState('progressId', props_details.progress_id);
                api.setState('progressText', `${status_label}: (${percent_complete}%) ${status_detail}`);

                if (percent_complete === 100) {
                    helpers.timing.clearInterval(progressTimerId);

                    // Clear the progress_id on the content block
                    api.data.ace_plugin_progress_tracker_1.execute({
                        content_block_id: api.context.props.data.block_id,
                        progress_id: ''
                    });
                    
                    showNotification('Plugin(s) installed successfully');

                }
            });
        }
        progressTimerId = helpers.timing.setInterval(getProgress, 2000);


    }

}
