
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
        action
    } = event.payload;

    if (action === 'create-new-list') {
         api.emit('LIST_CTRL#OPEN_MODAL', {
           route: 'new-list-modal',
           size: 'lg',
           fields: {},
           params: {} 
        });
   }
}
