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
    var kburl_Cloud= api.data.look_up_for_cloud_definition.result.kb_article_url.value;
    
    // Check if kburl_Cloud is null or empty - if so, don't set state
    if (!kburl_Cloud) return;

    // Validate KB URL format - must contain 'sysparm_article='
    if (kburl_Cloud.indexOf('sysparm_article=') === -1) {
        // Invalid format - don't set state
        return;
    }

    var kbNumber_Cloud = kburl_Cloud.split('sysparm_article=')[1].split('&')[0];
    
    api.setState('cloudKBNumber',kbNumber_Cloud  );
    api.setState('cloudKBurl', kburl_Cloud);


}
