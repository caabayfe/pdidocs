/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  let search = api.state.search;
  if(search && search.length > 0) {
    if(api.item.value.name.toLowerCase().indexOf(search.toLowerCase()) == -1)
      return true;
  }

  let filterType = api.state.filter;
  if(filterType === "type1")
    return false;
  if(filterType === "type2" && api.item.value.cmdb)
    return false;
  if(filterType === "type3" && api.item.value.totalSources != 0)
    return false;
  if(filterType === "type4"){
    return (api.state.attributelist.indexOf(api.item.value.attribute) == -1);
  }

	return true;
}

 
