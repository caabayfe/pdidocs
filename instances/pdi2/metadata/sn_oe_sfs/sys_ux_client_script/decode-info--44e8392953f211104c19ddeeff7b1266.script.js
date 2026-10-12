/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function () {
        //get the info param with encoded string containing '/' in it from the url
        var info = encodeURIComponent(this.window.location.href.split('info/')[1]);
        info = info.replace('%2F','__channel__');
        helpers.snHttp('/api/sn_oe_sfs/encode_decode_base64/' + info, {method: 'GET'})
            .then(({response}) => {
                if (response.result.channel == "slack") {
                    api.setState('externalName', response.result.name);
                }

                if (response.result.channel == "teams") {
                    api.setState('tenantName', response.result.email);
                }
                
                api.setState('app', response.result.app);
                api.setState('externalId', response.result.id);
                api.setState('currentMapping', response.result.current_mapping);
                api.setState('denyPath', response.result.error_page);
            })
            .catch(({error}) => {
                const message = `Error: ${error.data.error.message}`;
                console.error(message);
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                id: 'alert5',
                status: 'high',
                icon: 'info-circle-outline',
                content: message,
                action: { type: 'dismiss' }
                });
            });
     });
}
