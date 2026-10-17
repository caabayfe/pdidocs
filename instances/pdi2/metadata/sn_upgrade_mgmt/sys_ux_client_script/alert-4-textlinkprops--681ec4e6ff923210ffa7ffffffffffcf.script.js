/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  const isATFavailable = api?.data?.is_atf_app_available_1?.output;
  let link;
      if(isATFavailable){
          link = api.state.atfTestGeneratorAppLink1;
      }else{
          link = api.state.storeAppLink1;
      }
	return {
    "href": link,
    "label": "view app.",
    "opensWindow": true,
    "variant": "secondary"
  };

}
