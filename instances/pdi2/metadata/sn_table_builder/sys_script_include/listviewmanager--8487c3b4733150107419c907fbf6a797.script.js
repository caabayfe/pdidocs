var ListViewManager = Class.create();
ListViewManager.prototype = {
	initialize(table, view) {
		this.table = table;
		this.view = view === 'default' ? '' : view;
		this.viewId = this.getViewId();
	},

	/**
	 * @param {boolean} - if true gets the users personilized list
	 */
	getListElements(withCurrentUser) {
		var elements = [];
		var uiList = new GlideRecord(TBConstants.SYS_CLASS_UI_LIST);

		// NOTE: consider only top level list view which don't have parent/relationship
		uiList.addQuery('name', this.table);
		uiList.addQuery('view', this.viewId);
		uiList.addNullQuery('parent');
		uiList.addNullQuery('relationship');

		if (withCurrentUser) uiList.addQuery('sys_user', gs.getUserID());
		else uiList.addNullQuery('sys_user');

		uiList.query();

		if (uiList.next()) {
			var uiElement = new GlideRecord(
				TBConstants.SYS_CLASS_UI_LIST_ELEMENT
			);

			uiElement.addQuery('list_id', uiList.getValue('sys_id'));
			uiElement.orderBy('position');
			uiElement.query();

			while (uiElement.next()) {
				elements.push(uiElement.getValue('element'));
			}
		}

		return elements;
	},

	getViewId() {
		var gr = new GlideRecord(TBConstants.SYS_CLASS_UI_VIEW);
		gr.addQuery('name', this.view);
		gr.query();

		if (gr.next()) return gr.getValue('sys_id');

		return '';
	},

	type: 'ListViewManager',
};
