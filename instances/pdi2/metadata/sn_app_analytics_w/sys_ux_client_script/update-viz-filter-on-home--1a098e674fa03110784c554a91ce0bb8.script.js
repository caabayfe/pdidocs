/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/

function handler({api, event, helpers, imports}) {
	if(event.payload.selectedTabIndex == 0)
  {
      api.setState('vizFilterType', "bookmarked");
  }
  else
     api.setState('vizFilterType', "certified");
}
