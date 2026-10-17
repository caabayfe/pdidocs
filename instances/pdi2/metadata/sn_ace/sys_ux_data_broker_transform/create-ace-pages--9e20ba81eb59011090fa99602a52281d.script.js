function transform(input) {
    var output = [];
    var CONSTANTS = new ACEAppBuilderMetaData();
    var util = new sn_ace.ACEAppBuilderUtil();
    var baseGr = new GlideRecord(CONSTANTS.TABLES.PAGE);
    // ACE Base Experience Config ID
    baseGr.addQuery('ace_app', CONSTANTS.ACE_BASE_EXPERIENCE_CONFIG_ID);
    baseGr.orderBy('path');
    baseGr.query();
    var SEARCH_PAGE_ID;
    while (baseGr.next()) {
        if (input.loadDemoData || (CONSTANTS.UNUSED_PAGES_LIST.indexOf(baseGr.getValue('name')) == -1)) {
            var page = {
                name: baseGr.getValue('name'),
                template: baseGr.getValue('sys_id'),
                path: baseGr.getValue('path'),
                rootMacroponentId: ''
            };
            var screenGr = new GlideRecord('sys_ux_screen');
            screenGr.addQuery('screen_type', baseGr.route.screen_type.toString());
            screenGr.query();
            if (screenGr.next()) {
                page.rootMacroponentId = screenGr.macroponent.toString() || '';
                var urlParams = util.getFieldsAndParams(baseGr.route.toString());
                page.fields = urlParams.fields;
                page.params = urlParams.params;
            }
            var gr = new GlideRecord(CONSTANTS.TABLES.PAGE);
            gr.initialize();
            gr.name = page.name;
            gr.ace_app = input.aceAppId;
            gr.path = page.path;
            gr.template = page.template;
            if (gr.canCreate()) {
                page.sys_id = gr.insert();
                if (page.name === CONSTANTS.SEARCH_PAGE_NAME) {
                    SEARCH_PAGE_ID = gr.getUniqueValue();
                }
                output.push(JSON.parse(JSON.stringify(page)));
            }
        }
    }

    // Creating App levele Content Blocks
    util._createContentBlock(input.aceAppId, input.aceAppId, CONSTANTS.ACE_BASE_EXPERIENCE_CONFIG_ID, CONSTANTS.TABLES.APP_CONFIG, SEARCH_PAGE_ID);

    return output;
}
