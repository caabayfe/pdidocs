function transform(input) {
	  var extraParamsProp = {};

    if (input.inputExtraParams) {
        var propsArray = input.inputExtraParams.split("/");
        for (var i = 0; i < propsArray.length; i += 2) {
            extraParamsProp[propsArray[i]] = propsArray[i + 1];
        }
    }
	
	var preferences = [ "workspace.layout.type.",
			"workspace.layout.form_ratio.",
			"workspace.layout.sidebar_ratio.",
			"workspace.layout.section."];
		var prefOutput = [];
		preferences.forEach(function(preference){
			prefOutput.push(preference + input.table);
		});	
		prefOutput.push("personalize_" + input.table + "_" + input.view);

    var override = input.overrideAppContextConfigIds === true;
    var actionConfigId = override ? input.overrideActionConfigId : input.actionConfigId;
    var headerConfigId = override ? input.overrideHeaderConfigId : input.headerConfigId;
    var highlightedValueConfigId = override ? input.overrideHighlightedValueConfigId : input.highlightedValueConfigId;
    var ribbonConfigId = override ? input.overrideRibbonConfigId : input.ribbonConfigId;
    var viewRuleConfigId = override ? input.overrideViewRuleConfigId : input.viewRuleConfigId;

    return { 
      prefOutput: prefOutput,
      extraParamsProp: extraParamsProp,
      stringifiedSysId: input.sysId && typeof input.sysId !== 'string' ? String(input.sysId) : input.sysId,
      config: {
        actionConfigId: actionConfigId,
        headerConfigId: headerConfigId,
        highlightedValueConfigId: highlightedValueConfigId,
        ribbonConfigId: ribbonConfigId,
        viewRuleConfigId: viewRuleConfigId
      }
    };
}
