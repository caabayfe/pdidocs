/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const {name,value,displayValue} = event.payload;
   if (name === 'groups') {
      api.setState('sharedGroupsValue',value);
      api.setState('sharedGroupsDisplayValue',displayValue?.join(',')); 
   } else if( name === 'users') {
      api.setState('sharedUsersValue',value);
      api.setState('sharedUsersDisplayValue',displayValue?.join(','));
   }
}
