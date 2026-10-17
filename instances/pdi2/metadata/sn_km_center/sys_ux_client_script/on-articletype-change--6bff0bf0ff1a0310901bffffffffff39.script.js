/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.fieldName === 'article_type') {
        const value = event.payload.value;
        const isWiki = value === 'wiki';
        const isMarkdown = value === 'markdown';
        api.setState('isWikiArticle', isWiki);
        api.setState('isMarkdown', isMarkdown);
        api.setState('articleType', value);
    }
}
