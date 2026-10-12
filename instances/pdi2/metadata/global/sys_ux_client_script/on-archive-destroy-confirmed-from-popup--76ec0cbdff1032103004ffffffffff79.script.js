/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
  function handler({api, event, helpers, imports}) {
      const { deepClone } = imports["global.DMClientScriptUtils"]();                                                                                                                                           
      const { RULE_TYPE, STATE, MESSAGE_TYPE, EVENT, COLUMNS, UI_ELEMENT_ID } = imports["global.DMClientConstants"]();                                                                                         
                                                                                                                                                                                                               
      const ruleObj = deepClone(api.state[STATE.RULE_DATA]);                                                                                                                                                   
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.ENABLE_DATA_DESTROY] = false;                                                                                                                                   
      ruleObj[RULE_TYPE.ARCHIVE][COLUMNS.DESTROY_RELATED] = false;                                                                                                                                           
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.YEARS_DESTROY_DURATION] = 1;                                                                                                                                    
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.DAYS_DESTROY_DURATION]  = 0;
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.HOURS_DESTROY_DURATION] = 0;                                                                                                                                    
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.ACTIVATE_DESTROY] = false;                                                                                                                                      
      api.setState(STATE.RULE_DATA, ruleObj);                                                                                                                                                                  
      api.setState('isDestroyConfirmed', true);                                                                                                                                                                
  }                                                                                                                                                                                                            
   
