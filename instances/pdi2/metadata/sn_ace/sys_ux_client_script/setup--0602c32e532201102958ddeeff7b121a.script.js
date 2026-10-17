/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // TODO: Refactor for re-use

    function showNotification(msg, type = 'info') {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'PLUGIN_CARD_NOTIFICATION',
            eventPayload: [{
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
        mode
    } = (api.context.props.payload || {});
    
    if (status) {
        api.setState('status', status);
    }
    const headers = {
        'Content-Type': 'application/json'
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

                const pluginStatus = percent_complete < 100 ? ((mode == 'update') ? 'updating' : 'installing') : (
                    percent_complete === 100 ? ((mode == 'update') ? 'updated' : 'installed') : '');
                api.setState('status', pluginStatus);
                api.setState('progressId', props_details.progress_id);
                const progressTextLabel = (mode == 'update') ? 'Updating' : 'Installing';
                api.setState('progressText', `${progressTextLabel}: (${percent_complete}%)`);

                if (percent_complete === 100) {
                    helpers.timing.clearInterval(progressTimerId);

                    // Clear the progress_id on the content block
                    api.data.ace_plugin_progress_tracker_1.execute({
                        content_block_id: api.context.props.payload.block_id,
                        progress_id: ''
                    });
                    
                    showNotification('Plugin(s) installed successfully');

                }
            });
        }
        progressTimerId = helpers.timing.setInterval(getProgress, 2000);


    }

}
