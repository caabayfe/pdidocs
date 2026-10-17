function transform(input) {

    //UPDATE CONTEXT
    var gr = new GlideRecord('sn_ace_app_config');
    if (gr.get(input.aceAppConfig) && gr.canWrite()) {
        gr.setValue('context', JSON.stringify(input.context));
        gr.update();
    }

    // Create Content Block sub pages and update the subpage routes
    var util = new sn_ace.ACEAppBuilderUtil();
    util.updateAppConfigForSubPagesRoutes(input.screenType, input.context.content_block_id);
    var subPages = util.getContentBlockSubPages(input.aceAppName);
    util.cloneSubPages(input.aceAppName, input.uxAppConfigId, input.context.content_block_id, subPages);
}
