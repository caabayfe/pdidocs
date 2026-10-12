  /**                                                                                                                                                                                                            
   * @param {params} params                                                                                                                                                                                      
   * @param {api} params.api                                                                                                                                                                                     
   * @param {TransformApiHelpers} params.helpers                                                                                                                                                                 
   */                                                                                                                                                                                                            
 function evaluateProperty({ api }) {                                                                                                                                                                           
      const confirmation = api.data.rule_management_dmc?.ruleData?.onetime_delete?.confirmation;                                                                                                               
      const selectedTabId = api.data.rule_management_dmc?.selectedTabId;
      const selectedRuleType = api.data.rule_management_dmc?.selectedRuleType;                                                                                                                                   
      return (!confirmation && selectedTabId === 'onetime_delete.view_summary') || !selectedRuleType;
  }                                                                                                                                                                                                              
                                                                                                                                                                                                               
      
