(function(context) {

    function isAiSearchInitialized() {
        return new sn_ais.StatusApi().isAisInitialized();
    }

    function isAiSearchEnabled() {
        return new sn_ais.StatusApi().isAisEnabled();
    }

    function isAiSearchServiceConfigured() {
        var grS = new GlideAggregate('sys_service');
        grS.addQuery('name', 'AISearch');
        if (grS.getCount() > 0)
            return true;
        return false;
    }



    if (isAiSearchEnabled()) {
        // AI search is running
        context.subtitle = gs.getMessage('Set up AI Search');
    }
    context.subtitle = gs.getMessage('Request AI Search');

    paragraph_open = "<p style='font-family: `Open Sans`;font-style: normal;font-weight: 400;font-size: 12px;'>";
    paragraph_end = "</p><br><br>";
    context.props_details.rich_text = paragraph_open + gs.getMessage("The ServiceNow® AI Search application provides a modern consumer-grade search engine for ServiceNow® Service Portal, ServiceNow® Now Mobile, and ServiceNow® Virtual Agent. Intelligent query features enable users to quickly find the answers they need.") + "<br><br>" + "<a href='/fsdfs' target='_blank' style='text-decoration: none'>" + gs.getMessage("Learn more") + "</a>" + paragraph_end;
    context.props_details.image = '/images/IAR_AI.png';

})(context);
