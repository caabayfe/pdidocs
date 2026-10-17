(function(context) {

    var buttonLabel, url, isDisabled = false;

    var ciUtil = new sn_oe_sfs.CIUtil();

    if (ciUtil.isAiSearchInitialized()) {
        // AI search is running
        buttonLabel = gs.getMessage('Set up AI Search');
        url = '/$guided_setup.do?content=d585222f5b4310100977ca225681c72f#/content/d585222f5b4310100977ca225681c72f';

    } else if (ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchEnabled()) {
        // AI search is enabled
        buttonLabel = gs.getMessage('Request AI Search');
        isDisabled = true;

    } else {
        // AI search is not enabled
        buttonLabel = gs.getMessage('Request AI Search');
        url = '/ais_status.do';

    }

    context.title = buttonLabel;
    context.props_details.link = url;
    context.props_details.disabled = isDisabled;
    context.props_details.key = 'SETUP_AI_SEARCH';


})(context);
