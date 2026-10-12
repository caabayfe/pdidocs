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
    var translations = api.state.translations;
    helpers.translate('Save')
        .then((val) => {
            translations.save = val;
            api.setState("translations", translations)
        });

    helpers.translate('Update')
        .then((val) => {
            translations.update = val;
            api.setState("translations", translations);
        });
    helpers.translate('Add New Clone Instance')
        .then((val) => {
            translations.addNewCloneInstanceMsg = val;
            api.setState("translations", translations);
        });
    helpers.translate('Unable to Save the Instance')
        .then((val) => {
            translations.instanceAuthErrorPrefix = val;
            api.setState("translations", translations);
        });
    helpers.translate('Authentication Failed')
        .then((val) => {
            translations.authFailedMsg = val;
            api.setState("translations", translations);
        });
    helpers.snHttp('/api/sn_instance_clone/clone/util', {
        method: 'POST',
        body: {
            operation: "GET_IFRAME_URL"
        }
    }).then(response => {
        var result = response.response.result;
        if(!result.isError)
            api.setState('iFrameUrl',result.url);
    }).catch(resp => {
        if (!!resp.error) {
            try {} catch (e) {}
        }
    });
}
