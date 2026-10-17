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
    if (event ?.payload ?.eventPayload ?.blockContext) {
        if (!(JSON.stringify(event.payload.eventPayload.blockContext) === '{}'))
            api.setState("aceBlockContext", {...event.payload.eventPayload.blockContext,...{'__ACE_INTERNAL_TIMESTAMP__':Date.now()}});
    }
    if (event ?.payload ?.eventPayload ?.contentTree) {
        if (event.payload.eventPayload.contentTree.length > 0)
            api.setState("aceContentTree", event.payload.eventPayload.contentTree);
    }
}
