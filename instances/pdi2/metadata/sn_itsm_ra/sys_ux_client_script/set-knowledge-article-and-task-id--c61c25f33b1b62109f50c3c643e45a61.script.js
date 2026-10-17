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
    const {
        guidanceInputs
    } = api.context.props;
    const knowledgeArticleId = guidanceInputs && guidanceInputs.knowledge && guidanceInputs.knowledge.value;
    const taskId = guidanceInputs && guidanceInputs.task && guidanceInputs.task.value;
    if (knowledgeArticleId) {
        api.setState("knowledgeArticleId", knowledgeArticleId);
    }
    if (taskId) {
        api.setState("taskId", taskId);
    }
}
