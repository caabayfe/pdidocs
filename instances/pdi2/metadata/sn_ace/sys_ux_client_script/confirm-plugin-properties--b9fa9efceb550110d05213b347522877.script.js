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
    // call the installation flow
    // TODO: Refactor for re-use

    api.setState('hideProgressBar', false);
    api.setState('showLoader', true);

    function showNotification(status, msg, pluginName, currentVersion, newerVersion) {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'PLUGIN_CARD_NOTIFICATION',
            eventPayload: {
                pluginName,
                currentVersion,
                newerVersion,
                status,
                content: msg
            }
        });
    }

     function trackEvent(eventName) {
        const {telemetryData} = api.context.props.payload;

        if (telemetryData && telemetryData.disable)
            return;
        
        const plugins = api.state.plugins || 0;
        if (!plugins.length)
            return;
        
        const buttonLabel = api.context.props.payload.buttonLabel;
        plugins.forEach(p => {
            const pluginName = p.name || '';
            const pluginSysId = p.pluginId || '';
            let payload = {
                label: buttonLabel,
                pluginSysId: pluginSysId,
                pluginName: pluginName
            }

            if (telemetryData && telemetryData.append_to_payload)
                payload = {
                    ...payload,
                    ...telemetryData.append_to_payload
                }
        
            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: eventName,
                value: {
                    payload
                }
            });
        });
    }

    trackEvent('Start Plugin Install');
    const progressId = event.payload.data && event.payload.data.output.batchInfo && event.payload.data.output.batchInfo.execution_tracker_id;
    if (!progressId) {
        helpers.modal.close(`[component-id$='plugin_batch_install_update_modal']`);
        api.setState('hidePluginBatchInstallUpdateModal', true);
        helpers.modal.close(`[component-id$='single_plugin_install_update_modal']`);
        api.setState('hideSinglePluginInstallUpdateModal', true);
        api.setState('status','');
        api.setState('progressPercentage',100);
        trackEvent('Plugin Installation Failed');
        showNotification('error', 'Failed to get progress id');
        return;
    }
    api.setState('progressId', progressId);
    const translatedText = api.state.translations;

    const status = api.state.status;
    const installed = status === 'installed';
    const mode = api.context.props.payload.mode;
    if (status !== 'installing') {
        // Install plugin Flow

        helpers.modal.close(`[component-id$='plugin_batch_install_update_modal']`);
        api.setState('hidePluginBatchInstallUpdateModal', true);

        helpers.modal.close(`[component-id$='single_plugin_install_update_modal']`);
        api.setState('hideSinglePluginInstallUpdateModal', true);

        // Read plugins from state (not props) since modal props (demo data, etc) are in state
        const plugins = api.state.plugins;
        if (!plugins.length) {
            showNotification('error', 'No plugin configured for installation');
            return;
        }
        // Single plugin install or update
        if (plugins.length == 1) {
            var {
                name,
                currentVersion,
                newerVersion
            } = api.state.plugins[0] || {};
        }

        // set loading state
        let pluginStatus = (mode == 'update') ? 'updating' : 'installing';
        api.setState('status', pluginStatus);

        // Save the progress_id on the content block
        api.data.ace_plugin_progress_tracker_1.execute({
            content_block_id: api.context.props.payload.block_id,
            progress_id: progressId
        });

        // Start showing progress
        // TODO: Refactor for re-use
        let progressTimerId = null;

        function getProgress() {
            const progressUrl = `/api/sn_cicd/progress/${progressId}`;
            const headers = {
                'Content-Type': 'application/json'
            };

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
                    pluginStatus = (status_label == 'Running' || percent_complete < 100) ? ((mode == 'update') ? 'updating' : 'installing') : (
                        percent_complete === 100 && status_label == 'Successful' ? ((mode == 'update') ? 'updated' : 'installed') : '');
                    api.setState('status', pluginStatus);
                    api.setState('progressPercentage', percent_complete);

                    if (status_label == 'Failed' || (status_label == 'Successful' && percent_complete === 100)) {
                       trackEvent(`Plugin Installation ${status_label}`);
                        
                        api.setState('progressId', '');
                        helpers.timing.clearInterval(progressTimerId);

                        // Clear the progress_id on the content block
                        api.data.ace_plugin_progress_tracker_1.execute({
                            content_block_id: api.context.props.payload.block_id,
                            progress_id: ''
                        });
                        api.setState('hideProgressBar', true);
                        showNotification(status_label, status_message, name, currentVersion, newerVersion);
                    }
                })
                .catch(error => {
                    // Clear the progress_id on the content block
                    helpers.timing.clearInterval(progressTimerId);
                    api.data.ace_plugin_progress_tracker_1.execute({
                        content_block_id: api.context.props.payload.block_id,
                        progress_id: ''
                    });
                    api.setState('hideProgressBar', true);
                    showNotification('error', error, name, currentVersion, newerVersion);

                });
        }

        progressTimerId = helpers.timing.setInterval(getProgress, 8000);


    }
}
