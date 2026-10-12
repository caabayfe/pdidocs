var AJAXListColumns = Class.create();
AJAXListColumns.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getAllColumns: function() {
		var tableName = this.getParameter('tableName');
        var gr = new GlideRecord(tableName);

        // Secured.
		if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "AJAXListColumns.getAllColumns");
			return;
        }

		var sl = new GlideSysList(tableName);
		return sl.getAllListColumns();
	},

	getListColumns: function() {
		var tableName = this.getParameter('tableName');
        var gr = new GlideRecord(tableName);

        // Secured.
		if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "AJAXListColumns.getListColumns");
			return;
        }

		var columns = this.getParameter('selectedColumns');
		var sl = new GlideSysList(tableName);

		return sl.getListColumns(columns);
	},

	getListColumnsForView: function() {
		var tableName = this.getParameter('tableName');
        var gr = new GlideRecord(tableName);

        // Secured.
		if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "AJAXListColumns.getListColumnsForView");
			return;
        }

		var view = this.getParameter('view');
		var sl = new GlideSysList(tableName);

		return sl.getListColumnsForView(tableName, view, "", "");
	},

    type: 'AJAXListColumns'
});
