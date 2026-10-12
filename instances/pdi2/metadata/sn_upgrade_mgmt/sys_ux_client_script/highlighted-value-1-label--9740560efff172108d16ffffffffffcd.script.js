/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    const total = api.state.totalDependenciesCount || 0;
    const installationblocked = api.state.installationBlockedCount || 0;
    const message = helpers.translateSync(`${installationblocked} of ${total} not installable`);
    return message;
}
