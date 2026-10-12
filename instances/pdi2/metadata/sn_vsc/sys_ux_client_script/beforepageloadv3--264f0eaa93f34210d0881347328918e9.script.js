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
    //const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    //Use this client scrip for beforePage load actions. Use aceUtils Methods, blockContext and contentTree.
    const {

        eventName,
        eventPayload
    } = event.payload;
    await aceUtils.setContext(eventPayload.blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
    //Add your code from here
}
