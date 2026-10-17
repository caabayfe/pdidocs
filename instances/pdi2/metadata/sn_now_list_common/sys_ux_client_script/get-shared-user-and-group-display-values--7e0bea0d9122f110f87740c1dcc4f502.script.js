/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const results = api.data.fetch_usergroups_display_values_on_list_share_modal__1.output;
   if (results) {
      const usersData = results?.data?.GlideRecord_Query?.sys_user?._results || [];
      const groupsData = results?.data?.GlideRecord_Query?.sys_user_group?._results || [];

      const usersValue = usersData.map(/** @type {object} */ (user) => user?.sys_id?.value).join(',');
	   const groupsValue = groupsData.map(/** @type {object} */ (group) => group?.sys_id?.value).join(',');
      
      const usersDisplayValue = usersData.map(/** @type {object} */ (user) => user?.name?.value).join(',');
	   const groupsDisplayValue = groupsData.map(/** @type {object} */ (group) => group?.name?.value).join(',');

	   api.setState('sharedGroupsValue',groupsValue);
      api.setState('sharedGroupsDisplayValue',groupsDisplayValue); 
      api.setState('sharedUsersValue',usersValue);
      api.setState('sharedUsersDisplayValue',usersDisplayValue);
   }
   
   
}
