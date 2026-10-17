var AJAXListDefaultColumns = Class.create();
AJAXListDefaultColumns.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getColumns: function() {
		var tableName = this.getParameter('tableName');
		var gr = new GlideRecord(tableName);

		// Secured.
		if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "AJAXListDefaultColumns.getColumns");
			return;
        }

		var sl = new GlideSysList(tableName);
		return sl.getListRecords();
	},

	getListColumnsForView: function() {
		var tableName = this.getParameter('tableName');
		var gr = new GlideRecord(tableName);

		// Secured.
		if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "AJAXListDefaultColumns.getListColumnsForView");
			return;
        }

		var view = this.getParameter('view');
		var sl = new GlideSysList(tableName);

		return sl.getListColumnsForView(tableName, view, "", "");
	},


    type: 'AJAXListDefaultColumns'
});
