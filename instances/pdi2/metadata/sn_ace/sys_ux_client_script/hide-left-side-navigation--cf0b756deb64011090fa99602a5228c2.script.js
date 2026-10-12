/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    const navItems = api.state.navItems;
    const menuItems = navItems && navItems.menu
    return menuItems ? menuItems.length == 0 : true;
}
