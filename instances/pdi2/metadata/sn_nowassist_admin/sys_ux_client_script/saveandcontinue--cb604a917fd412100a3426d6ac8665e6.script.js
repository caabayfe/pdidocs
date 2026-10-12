/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const activateModal = 'a19a-cd21-8bbbbb-cee0-b9ab9ca9';
    const {
        eventName,
        eventPayload
    } = event.payload;
    let blockContext = {};
    blockContext = await aceUtils.getContext();
    if (eventName == "ACE_GUIDEDX_ITEM_UPDATED" && eventPayload.name === "applicability") {
        let isActiveVaPresent = eventPayload?.data?.some(obj => obj.isActive === true);
        if (eventPayload.data && isActiveVaPresent) {
            blockContext.isApplicablitySaveAndContinue = 'false';
        } else {
            blockContext.isApplicablitySaveAndContinue = 'true';
        }
      
        await aceUtils.setContext(blockContext);
    }
    
    if (eventName == "ACE_GUIDEDX_ITEM_UPDATED" && eventPayload.name === "samplePhrases") {
        api.emit("SCREEN_STATUS_CHANGED", {
            isDirty: true
        });
    }

    if (eventName == "ACE_GUIDEDX_SAVE_ACTION_PERFORM") {

        blockContext.guidexPagePayload = eventPayload;
        blockContext.aceGuidedxError = eventPayload.validation == 'failure';
        blockContext.aceGuidedxErrorMessage = eventPayload.error;
        blockContext.aceGuidedxIsLoading = true;
        await aceUtils.setContext(blockContext);
        var res = {};
        if (eventPayload.validation == 'success') {
            res = await aceUtils.refreshContentBlock('data_block_1');
        }
        blockContext.aceGuidedxIsLoading = false;
        if (eventPayload.name == 'getStarted') {
            blockContext.currFilter = res.props_details.data_block_output.currFilterDetails;
            blockContext.filterId = res.props_details.data_block_output.filterId;
        }

        await aceUtils.setContext(blockContext);
        api.emit("SCREEN_STATUS_CHANGED", {
            isDirty: false
        });

    } else if (eventName == "ACE_REVIEW_PAGE_CUSTOM_BUTTON") {
        blockContext.guidexPagePayload = {
            name: 'reviewPage',
            filterId: blockContext?.filterId
        };
        blockContext.aceGuidedxIsLoading = true;
        aceUtils.openModal(activateModal);
        await aceUtils.setContext(blockContext);
        var res = await aceUtils.refreshContentBlock('data_block_1');
        var isSuccess = res.props_details.data_block_output;
        
        var isActive = blockContext?.currFilter?.isActive;

        blockContext.aceGuidedxIsLoading = false;
        blockContext.isActivateError = isSuccess ? false : true;
        await aceUtils.setContext(blockContext);
        aceUtils.dismissModal(activateModal);
        if (isSuccess) {
            api.emit('NAV_ITEM_SELECTED', {
                route: 'filters',
                params: {
                    t: Date.now(),
                    status: 'activated',
                    filterName: blockContext?.currFilter?.name
                }
            });
        }else{
            blockContext.aceGuidedxError = true;
            blockContext.aceGuidedxErrorMessage = await helpers.translate("Some error occurred while activating filter {0}.", filterName)
            await aceUtils.setContext(blockContext);

    }
    }
}
