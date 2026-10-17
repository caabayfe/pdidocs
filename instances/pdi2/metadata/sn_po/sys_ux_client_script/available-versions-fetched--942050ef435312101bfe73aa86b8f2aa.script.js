/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const projectItem = api.data.look_up_project_record.items;

    const availableVersions = api.data.fetch_available_versions_1?.output?.data?.GlidePromin_Query?.comparableVersions;

    if (Array.isArray(availableVersions) && availableVersions.length > 0) {
        // Navigate to analyst workbench and close this page
        helpers.navigate.to('process-details', {
            versionId: availableVersions[0].id,
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } else {
        helpers.screen.updateStatus({
            title: await helpers.translate('Error')
        });

        if (!Array.isArray(projectItem) || projectItem.length === 0) {
            api.setState('emptyStateData', {
                heading: await helpers.translate('Project not found'),
                content: await helpers.translate('Go to the project list to browse existing projects.'),
                illustration: 'error',
                actions: [{
                    label: await helpers.translate('Go to process projects'),
                    variant: 'primary'
                }],
            });
        } else { 
            api.setState('emptyStateData', {
                heading: await helpers.translate('Unable to open project'),
                content: await helpers.translate('None of the project versions are available for viewing. Contact the owner to re-mine the project.'),
                illustration: 'error',
                actions: [],
            });
        }
    }

    api.setState('isLoading', false);
}
