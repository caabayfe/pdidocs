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
    const isPublish = api.state.publishPending;
    const isRepublish = api.state.republishPending;

    if (isPublish) {
        api.setState('publishPending', false);
        api.data.publish_knowledge_article_1.execute({
            articleId: api.context.props.sysId,
            articleTable: api.context.props.table
        });

        return;
    }

    if (isRepublish) {
        api.setState('republishPending', false);
        api.data.republish_knowledge_article_1.execute({
            articleId: api.context.props.sysId,
            articleTable: api.context.props.table
        });

        return;
    }
}
