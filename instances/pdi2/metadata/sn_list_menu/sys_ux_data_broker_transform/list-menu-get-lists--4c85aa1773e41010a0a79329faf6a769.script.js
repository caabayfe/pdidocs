function getListMenuModel(input) {
	var listMenu = input.graphqlData.data.GlideListMenu_Query.getListMenuLayout.listMenu;
	var categories = listMenu.categoryItems.filter(function(category) {
		return category.children.length > 0;
	});

	return {
		'sys_ux_list': {
			title: 'Lists',
			key: 'sys_ux_list',
			canEdit: false,
			canExpand: true,
			data: categories,
			newListForm: {}
		}, 
		'sys_ux_my_list': {
			title: 'My Lists',
			key: 'sys_ux_my_list',
			canEdit: true,
			canExpand: false,
			data: listMenu.menuItems,
			newListForm: {
        form: 'sys_ux_my_list.do',
        view: 'ux_modal'
      }
		}
	};
}
