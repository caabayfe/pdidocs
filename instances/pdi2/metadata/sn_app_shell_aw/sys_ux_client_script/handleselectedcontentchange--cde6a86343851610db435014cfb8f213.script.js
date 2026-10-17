
/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function script({ api, event }) {

  if (api.context.app.enable_resize_shell_container) {

    const selectedContent = event?.payload?.selectedContent;
    const route = selectedContent?.route;
    const table = selectedContent?.fields?.table;
    const parent = selectedContent.parent;

    api.setState("route", route);

    const showUtilityPanel = !api.elements.wsLayout?.hoistedContentConfiguration?.isHidden && !!api.elements.wsLayout.hoistedContentConfiguration.activeHoistedContent && api.elements.wsLayout.hoistedContentConfiguration.hasHoistedContent;

    if (
      parent &&
      parent.route === "record" &&
      parent.fields.table === "interaction"
      || showUtilityPanel
    ) {
      return;
    }

    if((selectedContent.fields && selectedContent.fields.sysId && table === 'interaction') || showUtilityPanel) 
     return;

    const newResizePaneConfig = {
      ...api.state.resizePaneConfig,
      defaultDisplayedPane: "right",
    };

    api.setState("resizePaneConfig", newResizePaneConfig);
  }
}
