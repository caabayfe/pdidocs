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
    var data = api.state.currentScreenData;
    if(!data)
        return;

    try {
        var _url = ""; 
        switch (event.elementId) {
                case 'link_1':
                    _url = data.links[0].url;
                    break;
                case 'link_2':
                    _url = data.links[1].url;
                    break;
                case 'link_3':
                    _url = data.links[2].url;
                    break;
                case 'link_4':
                    _url = data.links[3].url;
                    break;
                case 'link_5':
                    _url = data.links[4].url;
                    break;
            }
    }
    catch (e) {
    }
    if(_url ){
        const { navigateTo } = imports["global.CiRoutingUtils"]();
        navigateTo(api, { external : { url : _url }});
    }
}
