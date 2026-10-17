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
    function showNotification(msg, type = 'info') {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'PLUGIN_CARD_NOTIFICATION',
            eventPayload: {
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

    const status = api.state.status || api.context.props.payload.status;
    const installed = status === 'installed';
    const mode = api.context.props.payload.mode;
    const progressTextLabel = (mode == 'update') ? 'Updating' : 'Installing';

    if (status !== 'installing') {
        // Install plugin Flow

        helpers.modal.close(`[component-id$='plugin_properties_modal']`);
        api.setState('hideModal', true);

        helpers.modal.close(`[component-id$='plugin_properties_update_modal']`);
        api.setState('hideUpdateModal', true);

        helpers.modal.close(`[component-id$='single_plugin_install_modal']`);
        api.setState('hideSinglePluginInstallModal', true);

        helpers.modal.close(`[component-id$='single_plugin_update_modal']`);
        api.setState('hideSinglePluginUpdateModal', true);

        // Read plugins from state (not props) since modal props (demo data, etc) are in state
        const plugins = api.state.plugins; 
        if (!plugins.length) {
            showNotification('No plugin configured for installation', 'error');
            return;
        }
        const requestUrl = '/api/sn_cicd/app/batch/install';
        const requestMethod = 'POST';
        const requestBody = {
            name: `ACE Batch Install ${plugins.length} plugin(s)`,
            packages: plugins.map(p => {
                return {
                    id: p.id,
                    load_demo_data: p.install_demo_data,
                    type: p.type,
                    requested_version: p.type === 'application' ?
                        (mode == 'update' && p.newerVersion) ? p.newerVersion : p.currentVersion : undefined
                };
            })
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        // set loading state
        let pluginStatus = (mode == 'update') ? 'updating' : 'installing';
        api.setState('status', pluginStatus);

        helpers.snHttp(requestUrl, {
                method: requestMethod,
                body: JSON.stringify(requestBody),
                headers
            })
            .then(res => {
                const {
                    status_label,
                    status_message,
                    status_detail,
                    error,
                    percent_complete,
                    links
                } = res.response.result;

                const progress = links.progress;

                pluginStatus = percent_complete < 100 ? ((mode == 'update') ? 'updating' : 'installing') : (
                    percent_complete === 100 ? ((mode == 'update') ? 'updated' : 'installed') : '');
                api.setState('status', pluginStatus);
                api.setState('progressId', progress.id);
                api.setState('progressText', `${progressTextLabel}: (${percent_complete}%)`);

                // Save the progress_id on the content block
                api.data.ace_plugin_progress_tracker_1.execute({
                    content_block_id: api.context.props.payload.block_id,
                    progress_id: progress.id
                });

                // Start showing progress
                // TODO: Refactor for re-use
                let progressTimerId = null;

                function getProgress() {
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
                        pluginStatus = percent_complete < 100 ? ((mode == 'update') ? 'updating' : 'installing') : (
                            percent_complete === 100 ? ((mode == 'update') ? 'updated' : 'installed') : '');
                        api.setState('status', pluginStatus);
                        api.setState('progressId', progress.id);
                        api.setState('progressText', `${progressTextLabel}: (${percent_complete}%)`);

                        if (percent_complete === 100) {
                            api.setState('progressId', '');
                            helpers.timing.clearInterval(progressTimerId);

                            // Clear the progress_id on the content block
                            api.data.ace_plugin_progress_tracker_1.execute({
                                content_block_id: api.context.props.payload.block_id,
                                progress_id: ''
                            });

                            showNotification(status_message);
                        }
                    });
                }
                progressTimerId = helpers.timing.setInterval(getProgress, 5000);
            })
            .catch(error => {
                // Clear the progress_id on the content block
                helpers.timing.clearInterval(progressTimerId);
                api.data.ace_plugin_progress_tracker_1.execute({
                    content_block_id: api.context.props.payload.block_id,
                    progress_id: ''
                });
            });

    }
}
