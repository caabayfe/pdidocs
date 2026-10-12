
      
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
    helpers.modal.close();
    const sysId = api.state.sourceId;
    const targetSysId = api.state.targetId;

    helpers.navigate.to('attachment', {
        'attachmentld': `${sysId}`,
        'targetAttachmentld': `${targetSysId}`
    },{ }, false, false, 'current');
}
