/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.data.sow_team_management.canAddTeam) {
    return "";
  }
  
  return [{
    "label": helpers.translateSync("Add a team"),
    "tooltipContent": helpers.translateSync("Add or request a team"),
    "variant": "primary"
  }];
}
