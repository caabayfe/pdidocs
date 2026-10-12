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
    try {
        const {
            navigateTo
        } = imports["global.CiRoutingUtils"]();
        var _url = "";
        var data = api.state.currentScreenData;
        if (event.elementId == 'action_button' && data.actions[0]) {
            var link = data.actions[0].link;
            var _params = data.actions[0].params || {};
            _params.t = Date.now();
            if (data.actions[0].external && link != "") {
                _url = link;
            } else if (data.actions[0].route) {
                navigateTo(api, {
                    route: data.actions[0].route,
                    params: _params
                });
                return;
            } else {
                navigateTo(api, {
                    route: 'ci-list',
                    fields: {
                        'table': link
                    },
                    params: _params
                });
                return;

            }
        } else {
            if (event.name == 'NOW_SPLIT_BUTTON#ITEM_CLICKED') {
                _url = event.payload.item.link;
            }
            if (event.name == 'NOW_SPLIT_BUTTON#ACTION_CLICKED') {
                _url = data.actions[0].link;
            }
        }
        if (_url)
            navigateTo(api, {
                external: {
                    url: _url
                }
            });

    } catch (e) {

    }


}
