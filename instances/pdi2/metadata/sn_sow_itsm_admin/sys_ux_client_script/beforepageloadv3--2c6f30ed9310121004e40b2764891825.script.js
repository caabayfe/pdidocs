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
    const blockcontext = eventPayload.blockContext;

    if (api.context.session.user.roles.includes('sn_admin_center.read_only') || api.context.session.user.roles.includes('admin')) {
        const resource = await helpers.snHttp('/api/sn_admin_center/adminx/business_objectives', {
            method: 'GET',
            batch: false
        });
        const businessObjective = resource.response.result['d31c183450b2c110f877706569f9823e']; // Expand technology services while reducing costs - Adoption blueprint
        blockcontext.business_objectives_data = businessObjective;
        blockcontext.business_objectives_data.title = await helpers.translate("Expand technology services while reducing costs");
        blockcontext.business_objectives_data.link = `now/admin-center/adoption-blueprint-details/${businessObjective.id}`;
        blockcontext.business_objectives_data.aria_properties = await helpers.translate("View details of {0}", businessObjective.title);
        blockcontext.business_objectives_data.cardVisible = true;
    }

    await aceUtils.setContext(eventPayload.blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");

}
