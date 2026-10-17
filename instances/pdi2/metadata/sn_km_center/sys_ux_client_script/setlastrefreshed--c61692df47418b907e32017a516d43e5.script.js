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
    const FALLBACK_TIMEZONE = 'UTC';
    const STATE_LAST_REFRESHED_KEY = 'lastRefreshed';
    const LOCALE = 'en-US';

    if (!api || !api.context || !api.context.session || !api.context.session.user) {
        console.warn('handler: api.context.session.user is unavailable, aborting.');
        return;
    }

    const userTZ = api.context.session.user.timeZone || FALLBACK_TIMEZONE;

    let formatted;
    try {
        formatted = new Date().toLocaleString(LOCALE, {
            timeZone: userTZ
        });
    } catch (e) {
        console.warn('handler: toLocaleString failed for timeZone \'' + userTZ + '\', falling back to UTC. Error: ' + e);
        formatted = new Date().toLocaleString(LOCALE, {
            timeZone: FALLBACK_TIMEZONE
        });
    }

    helpers.translate('Last refreshed: ').then((prefix) => {
        api.setState(STATE_LAST_REFRESHED_KEY, prefix + formatted);
    });
}
