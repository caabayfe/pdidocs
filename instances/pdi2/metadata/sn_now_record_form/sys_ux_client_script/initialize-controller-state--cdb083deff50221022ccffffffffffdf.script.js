function initializeControllerState({ api, event, helpers, imports }) {

    var resConfigIds = {};
        
    // --- Overriding Configuration Ids?
    if (api.context.props.overrideAppContextConfigIds === true) {
      var props = api.context.props;
      resConfigIds = {
        actionConfigId:           props.overrideHeaderConfigId,
        headerConfigId:           props.overrideHighlightedValueConfigId,
        highlightedValueConfigId: props.overrideRibbonConfigId,
        ribbonConfigId:           props.overrideViewRuleConfigId,
        viewRuleConfigId:         props.overrideHeaderConfigId
      }
    } else {
      var app = api.context.app;
      resConfigIds = {
        actionConfigId:           app.actionConfigId,
        headerConfigId:           app.headerConfigId,
        highlightedValueConfigId: app.highlightedValueConfigId,
        ribbonConfigId:           app.ribbonConfigId,
        viewRuleConfigId:         app.viewRuleConfigId
      }
    }
    api.setState('effectiveConfigIds', resConfigIds);
}
