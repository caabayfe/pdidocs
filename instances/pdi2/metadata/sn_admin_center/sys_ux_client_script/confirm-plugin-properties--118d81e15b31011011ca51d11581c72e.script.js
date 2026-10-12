/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // call the installation flow
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

    const status = api.state.status || api.context.props.data.status;
    const installed = status === 'installed';

    if (status !== 'installing') {
        // Install plugin Flow

        helpers.modal.close(`[component-id$='plugin_properties_modal']`);
        api.setState('hideModal', true);

        // Read plugins from state (not props) since modal props (demo data, etc) are in state 
        const plugins = api.state.plugins; 
        if (!plugins.length) {
            showNotification('No plugin configured for installation', 'error');
            return;
        }
        const isMultiPlugin = plugins.length > 1; 
        let requestUrl = null,
            requestBody = null,
            requestMethod = null;

        if (isMultiPlugin) {
            requestUrl = '/api/sn_cicd/app/batch/install';
            requestBody = {
                name: `ACE Batch Install ${plugins.length} plugins`,
                packages: plugins.map(p => {
                    return {
                        id: p.id,
                        load_demo_data: p.install_demo_data,
                        type: p.type
                    };
                })
            };
            requestMethod = 'POST';
        } else {
            requestUrl = `/api/sn_cicd/plugin/${plugins[0].id}/activate`;
            requestBody = null;
            requestMethod = 'POST';
        }
        const headers = {
            'Content-Type': 'application/json',
            'X-UserToken': api.context.props.data.userXToken
        };

        // set loading state
        api.setState('status', 'installing');


        helpers.snHttp(requestUrl, {
            method: requestMethod,
            body: JSON.stringify(requestBody),
            headers
        })
        .then(res => {
            console.log('Install API response', res);
            const {
                status_label,
                status_message,
                status_detail,
                error,
                percent_complete,
                links
            } = res.response.result;
            const progress = links.progress;

            api.setState('status', percent_complete < 100 ? 'installing' : (
                percent_complete === 100 ? 'installed' : ''
            ));
            api.setState('progressId', progress.id);
            api.setState('progressText', `${status_label}: (${percent_complete}%) ${status_detail}`);

            // Save the progress_id on the content block
            api.data.ace_plugin_progress_tracker_1.execute({
                content_block_id: api.context.props.data.block_id,
                progress_id: progress.id
            });

            // Start showing progress
            // TODO: Refactor for re-use
            let progressTimerId = null;
            function getProgress() {
                console.log('Getting progress');
                const progressUrl = `/api/sn_cicd/progress/${progress.id}`;
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
                    api.setState('progressId', progress.id);                    
                    api.setState('progressText', `${status_label}: (${percent_complete}%) ${status_detail}`);

                    if (percent_complete === 100) {
                        helpers.timing.clearInterval(progressTimerId);

                        // Clear the progress_id on the content block
                        api.data.ace_plugin_progress_tracker_1.execute({
                            content_block_id: api.context.props.data.block_id,
                            progress_id: ''
                        });

                        showNotification(status_message);
                    }
                });
            }
            progressTimerId = helpers.timing.setInterval(getProgress, 2000);
        });

    }
}
