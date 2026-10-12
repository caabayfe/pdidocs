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
    const {
        snHttp
    } = helpers;
    const packages = api.state.installPlugins.map(plugin => {
        return {
            ...plugin,
            type: 'plugin',
            'load_demo_data': String(api.state.canLoadDemoData)
        };
    });

    snHttp(`/api/sn_cicd/app/batch/install`, {
            method: 'POST',
            batch: false,
            body: {
                name: 'Install Plugins',
                packages
            }
        })
        .then(({
            response
        }) => {
            let categories = api.data.get_setup_1.output.result.setup.steps.map(item => ({
                "id": item.sys_id
            }));
            let currentCategoryIndex = categories.findIndex(category => category.id === api.context.props.categoryId);
            let route, fields, params = {};
            let header = null;
            let controlExternalTask = null;
            if (api.context.props && api.context.props.hidePolarisHeader == 'true') {
                header = 'true';
            }

            if (api.context.props && api.context.props.controlExternalTask == 'true') {
                controlExternalTask = 'true';
            }
            if (currentCategoryIndex === categories.length - 1) {
                //Last category - Move to all categories
                route = 'setup';
                fields = {
                    sysId: api.context.props.setupId
                };
                params = {
                    'customId': new Date().getTime(),
                    'hidePolarisHeader': header,
                    'controlExternalTask': controlExternalTask
                };
            } else {
                //Move to next category
                route = 'tasks';
                fields = {
                    setupId: api.context.props.setupId
                };
                params = {
                    'categoryId': categories[currentCategoryIndex + 1].id,
                    'hidePolarisHeader': header,
                    'controlExternalTask': controlExternalTask
                };
            }

            snHttp(`/api/sn_ads_setup/play/log/setup/${api.context.props.setupId}/step/${api.state.taskId}`, {
                    method: 'POST',
                    batch: false,
                    body: {
                        action: 'started',
                        user_input: JSON.stringify(response.result),
                    }
                })
                .catch((
                    error
                ) => {
                    console.log(error);
                });

            api.emit('NAV_ITEM_SELECTED', {
                route,
                fields,
                params
            });
        })
        .catch(({
            error
        }) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert-1',
                    status: 'info',
                    icon: 'circle-info-outline',
                    content: api.state.pluginFailMsg,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        });
}
