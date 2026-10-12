/**
 * Close Dialog On Stage - this script is only used on the UIB stage to close the existing dialog
 * this is a destructive action and will remove the dialog from the state. There is no recovery from this.
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
   api.setState('modelessList', []);

   // Check if window manager modeless dialog is enabled and dispatch close on stage event to window manager
   if (event.meta?.uxfMeta?.UXF_WINDOW_MANAGER_SCREEN_INFO?.isWMModelessEnabled) {
      api.emit('UXF#CLOSE_MODELESS_WINDOW_ON_STAGE', {});
   }
}
