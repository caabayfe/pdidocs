/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const data = api.data.fetch_promin_ad_state_1.output.data.GlidePromin_Query;
    const report = data.scheduleModel.version.automationDiscoveryReport;
    const configured = api.context.props.prominConfig.automationDiscovery.isConfigured;
    
    // If there is no report, that means it needs to be configured
    if (!report) {
        if (!configured)
            api.setState('report_state', {
                illustration: 'unconfigured',
                heading: {
                    label: await helpers.translate('Unconfigured'),
                    level: 3,
                },
                content: await helpers.translate('Automation discovery configuration is missing'),
                actions: [{
                    label: await helpers.translate('Setup Process Configuration'),
                    prominType: 'open-config'
                }]
            });
        else 
            api.setState('report_state', {
                illustration: 'unconfigured',
                heading: {
                    label: await helpers.translate('No report found'),
                    level: 3,
                },
                content: await helpers.translate('Automation discovery report needs to be generated'),
                actions: [{
                    label: await helpers.translate('Generate report'),
                    prominType: 'resubmit'
                }]
            });
        return;
    }

    // If it is completed, then it can be shown
    if (report.id) {
        api.setState('report_id', report.id);
        api.setState('report_hidden', false);
        api.setState('status_hidden', true);

        // If it completed in error
        if (['timed_out', 'unauthorized', 'solution_error', 'solution_cancelled'].indexOf(report.statusName) >= 0) 
			api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
				items: [{
                    id: 'model-fetch-error',
                    status: 'critical',
                    icon: 'exclamation-triangle-outline',
                    content: await helpers.translate('An error occured: {0}', report.statusLabel),
                    action: { type: 'dismiss' },
                }],
			});
            
        return;
    }

    api.setState('report_state', {
        illustration: 'first-time-user',
        heading: {
            label: await helpers.translate('Report in progress'),
            level: 3,
        },
        content: await helpers.translate('Report is not done yet. Currently "{0}"', report.statusLabel),
        actions: [{
            label: await helpers.translate('Refresh'),
            prominType: 'refresh'
        }]
    });
}
