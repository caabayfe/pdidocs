/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var INTERACTION_TYPE = {
    NONE: 'none',
    CLICK: 'click'
  };
  // Disable rule type selection for a saved rule(with sys_id attribute set).
  var ruleData = api.data.rule_management_dmc.ruleData;
  var ruleType = api.data.rule_management_dmc.selectedRuleType;
  if(!ruleData || !ruleType) return INTERACTION_TYPE.NONE;
  var ruleObject = ruleData[ruleType];
  if(ruleObject['sys_id']) return INTERACTION_TYPE.NONE;

  // Disable rule type selection based on table eligibility
  var tableEligibleForRuleType = api.data.rule_management_dmc.tableEligibleForRuleType;
  if(!tableEligibleForRuleType) return INTERACTION_TYPE.NONE;
  
  var valid = tableEligibleForRuleType[api.item.value.id];
  if(valid) return INTERACTION_TYPE.CLICK;
  else return INTERACTION_TYPE.NONE;
}
