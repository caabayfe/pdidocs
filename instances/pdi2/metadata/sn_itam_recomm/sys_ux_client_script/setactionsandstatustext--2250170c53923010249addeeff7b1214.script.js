/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {    
     if(api.state.isRealTimeLoad){
          api.setState('isLoading', false);
          api.setState('statusText', api.data.run_important_actions.output.last_refresh_message);
          api.setState('importantActions', api.data.run_important_actions.output.cards_metadata);
     }
     else{
          let { last_refresh_message, next_refresh_message }  = api.data.run_important_actions.output;
          if (last_refresh_message !== '') {
               api.setState('statusText', last_refresh_message + ' | ' + next_refresh_message);
          } else {
               api.setState('statusText', next_refresh_message);
          }
     }
}
