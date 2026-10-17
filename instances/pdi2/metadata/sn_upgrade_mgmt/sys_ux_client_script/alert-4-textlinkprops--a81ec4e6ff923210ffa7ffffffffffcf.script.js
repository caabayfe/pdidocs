/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

	const isATFavailable = api?.data?.is_atf_app_available_2?.output;
  let link;
        if(isATFavailable){
            link = api.state.atfTestGeneratorAppLink2;
        }else{
            link = api.state.storeAppLink2;
        }

	return {
    "href": link,
    "label": "view app.",
    "opensWindow": true,
    "variant": "secondary"
  };
}
