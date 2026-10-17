/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    debugger;

    if (api.state.timeoutId) {
        helpers.timing.clearTimeout(api.state.timeoutId);
    }

    const mapData = api.state.mapData;
    if (!mapData) {
        return;
    }
    const start = api.data.sandboxController.mapDataOut.start;
    if (!start) {
        return;
    }

    const finish = Date.now();
    const timeoutId = helpers.timing.setTimeout(() => {
        var i = api.state.i;
        i++;
        api.setState('i', i);
        var id = "alert" + i;

        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: id,
                status: "warning",
                icon: "info-circle-outline",
                content: 'Map rendered in ' + (finish - start).toString() + ' ms',
                action: {
                    type: "dismiss"
                }
            }]
        });

        helpers.timing.setTimeout(() => {
            api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
                items: [{
                    id: id
                }]
            });
        }, 2000);


        api.setState('timeoutId', null);
    }, 3000);

    api.setState('timeoutId', timeoutId);
}
