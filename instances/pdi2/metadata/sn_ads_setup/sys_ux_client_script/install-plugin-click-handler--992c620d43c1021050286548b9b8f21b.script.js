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

    const {
        associatedRecord: stepId
    } = api.context.props;

    const packages = api.state.installPlugins.map(plugin => {
        return {
            ...plugin,
            type: 'plugin',
            'load_demo_data': String(api.state.canLoadDemoData)
        };
    });

    api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
        loading: true,
        contextId: api.state.contextId
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
            const reqObj = {
                step_input: JSON.stringify(response.result),
            };
            api.setState('cicdResponse', response.result);

            snHttp(`/api/sn_ads_setup/play/stepinput/step/${stepId}`, {
                method: 'PUT',
                batch: false,
                body: reqObj
            }).
            then((response) => {
                    api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                        loading: false,
                        contextId: api.state.contextId
                    });
                    api.data.get_user_interaction_step.refresh();
                })
                .catch((
                    error
                ) => {
                    console.log('Error "stepinput/step" api call', error);
                    api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                        loading: false,
                        contextId: api.state.contextId
                    });
                });
        })
        .catch(({
            error
        }) => {
            console.log('Error "batch/install" api call', error);
            api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                loading: false,
                contextId: api.state.contextId
            });
        });
}
