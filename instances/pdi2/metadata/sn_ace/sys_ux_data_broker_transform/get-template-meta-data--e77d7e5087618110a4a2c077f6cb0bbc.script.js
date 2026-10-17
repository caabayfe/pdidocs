function transform(input) {
    var output = {
        templateRouteId: '',
        templateMacroponentId: '',
        templateMacroponentConfig: ''
    };

    var pageGr = new GlideRecord('sn_ace_page');
    if (pageGr.get(input.templateId)) {
        output.templateRouteId = pageGr.route.toString();
    }

    var screenGr = new GlideRecord('sys_ux_screen');
    screenGr.addQuery('screen_type', pageGr.route.screen_type.toString());
    screenGr.query();
    if (screenGr.next()) {
        output.templateMacroponentId = screenGr.macroponent.toString();
        output.templateMacroponentConfig = screenGr.macroponent_config.toString();
    }
    return output;
}
