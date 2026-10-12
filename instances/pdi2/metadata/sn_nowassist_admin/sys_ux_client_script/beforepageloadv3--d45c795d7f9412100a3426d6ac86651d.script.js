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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    //Use this client scrip for beforePage load actions. Use aceUtils Methods, blockContext and contentTree.
    const {

        eventName,
        eventPayload
    } = event.payload;
    await aceUtils.setContext(eventPayload.blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
    //Add your code from here
    
    let blockcontext = await aceUtils.getContext();
    blockcontext.guidedExId = blockcontext.pageParams.filterId;
    var param = blockcontext.pageParams.filterId;
    let contentBlocks = await aceUtils.getContentBlocks();
    if (contentBlocks && contentBlocks.length > 0) {
        var contentBlockIndex = 0;
        for(var index = 0; index < contentBlocks.length; index++) {
            if(contentBlocks[index].elementId == 'guided_experience_13b8e820c') {
                contentBlockIndex = index;
                break;
            }
        }
        let guideXblock = contentBlocks[contentBlockIndex];
        for (let child in guideXblock.children) {
            let childCB = guideXblock.children[child]
            if (childCB && childCB.props_overrides && childCB.props_overrides.props_details) {
                Object.keys(childCB.props_overrides.props_details).forEach(function(key) {
                    if (key === param) {
                        var value = JSON.parse(JSON.stringify(childCB.props_overrides.props_details));
                        value.status = childCB.props_overrides.props_details[key].status;
                        childCB.props_overrides.props_details = value;
                    }
                });
            }
        }
        contentBlocks[contentBlockIndex] = guideXblock;
        await aceUtils.setContentBlocks(contentBlocks);
    }

    api.emit('ACE_PAGE_READY', {
        blockcontext
    });

   
}
