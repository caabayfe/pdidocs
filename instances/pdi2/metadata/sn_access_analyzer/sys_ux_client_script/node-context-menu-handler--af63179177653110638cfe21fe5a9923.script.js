/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
	const nodeSelected = "SN_NODE_MAP#ELEMENT_SELECTED";
	const ctxMenuItemClicked = "SN_NODE_MAP#CONTEXT_MENU_ITEM_CLICKED";
	const eventName = event.name;

	if (eventName !== nodeSelected && eventName !== ctxMenuItemClicked) {
		return;
	}

	if (eventName === ctxMenuItemClicked) {
		handleCtxMenuClickedEvent();
		return;
	}

	const ROLE_DETAILS_MENU_ID = "role_details", ROLE_RESOURCES_MENU_ID = "role_resources",
		GROUP_DETAILS_MENU_ID = "group_details", USER_DETAILS_MENU_ID = "user_details";
	const menuLabels = {
		[ROLE_DETAILS_MENU_ID]: await helpers.translate("View role details"),
		[ROLE_RESOURCES_MENU_ID]: await helpers.translate("Show all resources this role can provide access"),
		[GROUP_DETAILS_MENU_ID]: await helpers.translate("View group details"),
		[USER_DETAILS_MENU_ID]: await helpers.translate("View user details")
	};
	handleNodeSelectedEvent(menuLabels);


	function handleCtxMenuClickedEvent() {
		const {navigate} = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
		navigate({external: event.payload.item.url});
	}

	function handleNodeSelectedEvent(menuLabels) {
		const nodeType = event.payload.node.nodeType;
		const nodeId = event.payload.node.id;
		const {navTo} = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
		let menuItems = [];
		switch (nodeType) {
			case "Role":
				menuItems = getRoleMenuItems(nodeId, navTo, menuLabels);
				break;

			case "Group":
				menuItems = getGroupMenuItems(nodeId, navTo, menuLabels);
				break;

			case "User":
				menuItems = getUserMenuItems(nodeId, navTo, menuLabels);
				break;
		}
		api.setState("contextMenuItems", menuItems);
	}

	function getRoleMenuItems(roleSysId, navTo, menuLabels) {
		const roleDetailsMenu = getMenuItem(ROLE_DETAILS_MENU_ID, menuLabels[ROLE_DETAILS_MENU_ID],
			navTo("sys_user_role", roleSysId));
		const roleResourcesMenu = getMenuItem(ROLE_RESOURCES_MENU_ID, menuLabels[ROLE_RESOURCES_MENU_ID], 
			getRoleResourcesMenuURL(roleSysId));
		return [roleDetailsMenu, roleResourcesMenu];
	}
	
	function getRoleResourcesMenuURL(roleSysId) {
		const {navToList} = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
		var params = "sysparm_view=access_analyzer&sysparm_view_forced=true&"
			.concat(`sysparm_query=sys_user_role=${roleSysId}`);
		if (api.context.session.user.roles.includes('admin')) {
			params = params.concat("^GROUPBYsys_security_acl.type&sysparm_group_sort=COUNTDESC");
		}
		return navToList("sys_security_acl_role", params);
	}

	function getGroupMenuItems(groupSysId, navTo, menuLabels) {
		return [getMenuItem(GROUP_DETAILS_MENU_ID, menuLabels[GROUP_DETAILS_MENU_ID], navTo("sys_user_group", groupSysId))];
	}

	function getUserMenuItems(userSysId, navTo, menuLabels) {
		return [getMenuItem(USER_DETAILS_MENU_ID, menuLabels[USER_DETAILS_MENU_ID], navTo("sys_user", userSysId))];
	}

	function getMenuItem(id, label, url) {
		return {
			id: id,
			label: label,
			icon: "open-link-right-outline",
			url: url
		};
	}
}
