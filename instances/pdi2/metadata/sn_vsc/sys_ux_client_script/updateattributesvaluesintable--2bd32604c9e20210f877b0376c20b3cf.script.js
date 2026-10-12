/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
      var attributes = api?.state?.glideVariablesValue;
      api.setState("actionAttributes", attributes);

      var removedConditions = api?.state?.removedConditionId;
      api.setState("UIConditionRemoved", removedConditions);

      var removedNotifications = api?.state?.removedNotifications;
      api.setState("UINotificationsRemoved", removedNotifications);

      var checkboxValues = api.state.checkboxValue;
      api.setState("checkboxValObj", checkboxValues);

      var conditionLogicFromUI = api?.state?.conditionLogicFromUI;
      api.setState("conditionLogicPayload", conditionLogicFromUI);
}
