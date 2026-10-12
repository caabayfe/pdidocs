/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {pageContentBlockData} = api.state;
  if (pageContentBlockData.length) {
    return pageContentBlockData[0].children[0];
  }
  return {
    type: {
      id: '1234'
    }
  };
}
