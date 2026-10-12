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
    const contentPacks = api.data.look_up_record_for_content_pack.results;
    const value = Boolean(Array.isArray(contentPacks) && contentPacks.length > 0);
    api.setState('isCurrentEntityHasContentPack', value);
    api.setState('createUsingContentPack', value);
}
