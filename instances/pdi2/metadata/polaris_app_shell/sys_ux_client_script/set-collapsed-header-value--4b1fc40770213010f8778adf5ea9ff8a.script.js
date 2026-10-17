/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const preference = api.context.session.user.preferences.find(({name}) => name === "glide.ui.polaris.landing_page_header_collapsed") || {};
        return api.setState('collapsedHeader', preference.value || false);
}
