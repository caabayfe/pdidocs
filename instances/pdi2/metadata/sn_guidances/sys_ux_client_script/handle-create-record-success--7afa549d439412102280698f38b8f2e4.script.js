/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const FLAG_ARTICLE_EVENT_NOTIFICATION_MESSAGE = "Article has been flagged";
    const MARK_ARTICLE_HELPFUL_NOTIFICATION_MESSAGE = "Article has been marked as helpful";
    const SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION = "SN_GUIDANCE_EXPERIENCE_CONNECTED#GUIDANCE_NOTIFICATION_PROPOGATION";
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);

    let IS_FLAG_EVENT = event.payload.data.output.data.GlideRecord_Mutation.insert_kb_feedback.flagged;

    if (IS_FLAG_EVENT) {
        attachArticleGuidanceHelper.emitNotificationEvent(SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION, FLAG_ARTICLE_EVENT_NOTIFICATION_MESSAGE);
    } else {
        attachArticleGuidanceHelper.emitNotificationEvent(SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION, MARK_ARTICLE_HELPFUL_NOTIFICATION_MESSAGE);
    }
}
