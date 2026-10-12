/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
      const {totalCount, filteredPractices} = api.data.sc_get_filtered_list_of_best_practices.output;
      api.setState("filteredPracticesCount", filteredPractices.length);
      api.setState("totalPracticesCount", totalCount);
}
