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
  if (sharedUsersValue === api.state.sharedUsersValue && sharedGroupsValue === api.state.sharedGroupsValue) {
    return true;
  }
	return false;
}
