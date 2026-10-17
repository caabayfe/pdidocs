/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    return api.state.sessionType === 'bulk_app_update' ? helpers.translateSync(
        "Commit the update set to the next environment to apply your configurations. Choices made during pre-update tasks for your applications will carry over automatically."
    ) : helpers.translateSync(
        "Commit the update set to the next environment to apply your configurations. Choices made during Pre-upgrade tasks for your applications will carry over automatically."
    );
}
