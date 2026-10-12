/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const {
    pcName = "",
    selectedAppShell,
    selectedComponent,
    description = "",
    controllerDepObj = {},
  } = api.state;

  if (pcName && selectedAppShell && Object.keys(selectedAppShell).length && selectedComponent && Object.keys(selectedComponent).length) {
    api.setState("validateNextButton", true);
  }
  const isControllerValid =
    Object.keys(controllerDepObj).length &&
    Object.keys(controllerDepObj).every(
      (elem) =>
        controllerDepObj[elem].definition &&
        controllerDepObj[elem].depKey &&
        controllerDepObj[elem].definition.id &&
        controllerDepObj[elem].definition.name
    );
  if (isControllerValid) {
    api.setState("validateCreateButton", true);
  }
  else {
    api.setState("validateCreateButton", false);

  }
}
