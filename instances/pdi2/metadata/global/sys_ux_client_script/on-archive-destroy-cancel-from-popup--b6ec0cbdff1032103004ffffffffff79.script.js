/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
  function handler({api, event, helpers, imports}) {
      const {deepClone} = imports["global.DMClientScriptUtils"]();                                                                                                                                             
      const {RULE_TYPE, STATE, UI_ELEMENT_ID} = imports["global.DMClientConstants"]();
                                                                                                                                                                                                               
      if(api.state.isDestroyConfirmed) {                                                                                                                                                                       
          api.setState('isDestroyConfirmed', false);
          return;                                                                                                                                                                                              
      }                                                                                                                                                                                                      

      const ruleObj = deepClone(api.state[STATE.RULE_DATA]);
      ruleObj[RULE_TYPE.ARCHIVE][UI_ELEMENT_ID.ENABLE_DATA_DESTROY] = true;
      api.setState(STATE.RULE_DATA, ruleObj);                                                                                                                                                                  
  }
