/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     if(api.context.props.redirect == 'true' && api.data.look_up_records_teams.results.length >0 && api.data.look_up_records.results.length > 0){
         const message = api.data.look_up_records.results.length == 1 ? 'Your configuration package is ready. Download now.' :
         'Your configuration package has been updated and is ready for download.';
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'Download',
                    status: 'positive',
                    icon: 'info-circle-outline',
                    content: message,
                    action: { type: 'dismiss' }
                }]
            
            });
    }
}
