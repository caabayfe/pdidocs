/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   var ciFilters = {};
   var filters = api.data.get_ms_ci_filters.results;
   for (var i in filters) {
      var filter = filters[i];
      var id = filter['sys_id']['value'];
      ciFilters[id] = {};
      ciFilters[id]['id'] = id;
      ciFilters[id]['label'] = filter['name']['displayValue'];
      ciFilters[id]['encodedQuery'] = filter['encoded_query']['value'];
   }
   var filterDropDownValues = Object.values(ciFilters);
   api.setState('ciFilters', ciFilters);
   api.setState('filterDropDownValues',filterDropDownValues);
   //Set 'All' by default
   api.setState('selectedCIFilter', ['97210c0743c331105552c29835b8f2e6']);
}
