/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const listMenuModel = api.data.controller.listMenu.model;
  const selectedMenuId = listMenuModel.selectedListMenuItem.id;
  const sharedUsersValue = (listMenuModel.menuItems[selectedMenuId]?.sharedUsers || []).join(',');
  const sharedGroupsValue = (listMenuModel.menuItems[selectedMenuId]?.sharedGroups || []).join(',');
  if (!api.state.sharedGroupsValue && !api.state.sharedUsersValue && (sharedUsersValue || sharedGroupsValue)) {
    return helpers.translateSync('Save');
  }
  return helpers.translateSync('Share');
}
