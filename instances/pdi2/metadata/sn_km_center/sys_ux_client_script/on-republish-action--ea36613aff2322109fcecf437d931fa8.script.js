/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const pending = api.state.republishPending;
    if (pending) {
        return;
    }
    
    // Set the pending state so we can handle any visual treatment we might want
    api.setState('republishPending', true);

    // Trigger the timestamp update so ECE saves the files.
    api.setState('lastSavedTimestamp', Date.now());

    // DEF0823254: Republish is only available on retired articles, which are
    // always readonly. Since DEF0812807 hides ECE for readonly articles via
    // the isHidden condition, ECE may
    // not be in the DOM and INTERNAL_ASSET_SAVED will never fire. Invoke the
    // republish data broker directly as a fallback.
    api.data.republish_knowledge_article_1.execute({
        articleId: api.context.props.sysId,
        articleTable: api.context.props.table
    });
}
