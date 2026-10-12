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
    let blockContext = event.payload.blockcontext;
    let contentBlocks = event.payload.contentBlocks || api.state.stagedContentBlocks;
    api.setState("contentBlocks", contentBlocks);

    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const context = aceUtils.addDataBlockOutputMappingToContext(contentBlocks, blockContext);
    const onboardingModalViewed = context.onboardingModalViewed;
    const onboardingModalID = '71e1-baaa-998b8b-84e8-ab9a0989';
    const feedbackModalID = 'a560-770d-99a898-c16b-a9bb419b';
    if (!(onboardingModalViewed == "true" || onboardingModalViewed == true)) {
        aceUtils.openModal(onboardingModalID);
    }
    else if (context.showFeedbackModal){
        aceUtils.openModal(feedbackModalID);
    }
    
}
