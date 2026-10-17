/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    if (api.item.value.members.length < 3) {
        return "";
    }

    const count = api.item.value.members.members.length - 2;
    const teamName = api.item.value.team_name.displayValue;
    return {
        "button": {
            "aria-label": helpers.translateSync("Show {0} more members for team {1}", count, teamName)
        }
    };
}
