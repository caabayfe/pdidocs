/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var id = event.payload.context.row.key;
    helpers.timing.setTimeout(function() {
        var idx = this.location.href.indexOf('/record/');
        var path = this.location.href.substring(0, idx) + '/record/task/' + id;
        api.emit('NAV_ITEM_SELECTED', {
        external: {
            url: path
        }
    });
    }, 0);
    
}
