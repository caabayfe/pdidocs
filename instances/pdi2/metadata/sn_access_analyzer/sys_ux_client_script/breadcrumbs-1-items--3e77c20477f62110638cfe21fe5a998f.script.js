/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const viewType = api?.context?.props?.viewType;
  const requestId = api?.context?.props?.requestId;
  let baseUrlForHref = "now/access-management";
  const bcItems = [];
  bcItems.push({
      "label": helpers.translateSync("Overview"),
      "href": baseUrlForHref + "/overview",
      "hideLabel": false
  });

  bcItems.push({
      "label": helpers.translateSync("Access analyzer"),
      "href": baseUrlForHref+ "/access-analyzer",
      "hideLabel": false
  });


  /**
   * If viewType is traditional:
   * 1. The leaf node of the breadcrumb should be the ACL name itself.Otherwise, the leaf node should be the name of the resource. For example: Tool name, Agent name, et.c
   * 2. Let it read from the result title. Otherwise, the title should be the name of the consumer for example: AI Agent Name/Workflow name/Tool name, etc.
   * */ 
  const resultsBaseUrlForHref = baseUrlForHref + "/results/" + requestId;
  if (!viewType) {
    var op = api.data.result_resource.result.operation.displayValue;
    bcItems.push({
        "label": helpers.translateSync(api.state.resultTitle),
        "href": resultsBaseUrlForHref,
        "hideLabel": false
    });
    bcItems.push({
        "label": op.charAt(0).toUpperCase() + op.slice(1)
    });
  } else {
    const resource_name = api?.data?.get_header_data?.output?.resource_name;
    const parent_name = api?.data?.get_header_data?.output?.parent_name;
    const href = resultsBaseUrlForHref + "/params/viewType/" + viewType;
    bcItems.push({
        "label": helpers.translateSync("Permissions for " + parent_name),
        "href": href,
        "hideLabel": false
    });
  
    bcItems.push({
        "label": resource_name
    });
  }

  return bcItems;
}
