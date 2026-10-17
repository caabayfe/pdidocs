/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { unableToDeleteConfigs } = event.payload.data.output.data.snPo.GlideProminProcessConfigurations.deleteProcessConfigurations;
    let selectedConfigListItems = [...api.state.selectedConfigListItems];

    if (Array.isArray(unableToDeleteConfigs)) {
        if (unableToDeleteConfigs.length > 0) {
            const unableToDeleteConfigLabels = selectedConfigListItems.filter(row => unableToDeleteConfigs.includes(row.id)).map(row => `<b>${row.label}</b>`);

            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'delete-configurations-error',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + await helpers.translate('Unable to delete configuration for {0} table(s) as it contains improvement opportunity definitions. Delete the definitions first and try again.', unableToDeleteConfigLabels.join(', ')) + '</span>',
                    },
                    action: {
                        type: 'dismiss'
                    },
                }]
            });
        }

        selectedConfigListItems = selectedConfigListItems.filter(row => unableToDeleteConfigs.includes(row.id));
    } else {
        selectedConfigListItems = [];
    }

    api.data.gliderecord_collection_query_1.refresh();
    api.setState('selectedConfigListItems', selectedConfigListItems);
}
