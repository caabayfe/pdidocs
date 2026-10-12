var TransferOrderLineBulkUpdateAjax = Class.create();
TransferOrderLineBulkUpdateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	ALM_TO_LINE_TASK_TABLE: 'alm_transfer_order_line_task',
	ALM_TO_LINE_TABLE: 'alm_transfer_order_line',
	OPEN_STATE: 1,
	INPROGRESS_STATE: 2,

	getLineItems: function() {
		var toSysId = this.getParameter('sysparm_id');
		var selectedStage = this.getParameter('sysparm_stage');
		var finalLineItemHash = {};
		if (gs.nil(toSysId) || gs.nil(selectedStage)) {
			return;
		}
		// Query all 'Open' and 'In progress' tasks for the given stage
		var lineTaskGr = new GlideRecord(this.ALM_TO_LINE_TASK_TABLE);
		lineTaskGr.addQuery('transfer_order_line.transfer_order', toSysId);
		lineTaskGr.addQuery('stage', selectedStage);
		var q = lineTaskGr.addQuery('state', this.OPEN_STATE);
		q.addOrCondition('state', this.INPROGRESS_STATE);
		lineTaskGr.orderBy('transfer_order_line.number');
		lineTaskGr.query();
		while (lineTaskGr.next()) {
			var toLine = lineTaskGr.transfer_order_line;
			if (gs.nil(finalLineItemHash[toLine.toString()])) {
				finalLineItemHash[toLine.toString()] = {
					number: toLine.number.toString(),
					asset: toLine.asset.display_name.toString(),
					model: toLine.model.display_name.toString(),
					model_class: toLine.model.sys_class_name.toString(),
					qty_req: toLine.quantity_requested.toString(),
					qty_rec: toLine.quantity_received.toString(),
					asset_tracking_strategy: toLine.model.asset_tracking_strategy.toString(),
				};
			}
		}
		var itemDetails = this.newItem('lineItemsHash');
		itemDetails.setAttribute('lineItemsHash', JSON.stringify(finalLineItemHash));
	},
	showBulkUpdate: function(toSysId) {
		if (gs.nil(toSysId)) {
			return false;
		}
		var toLineGr = new GlideRecord('alm_transfer_order_line');
		toLineGr.addQuery('transfer_order', toSysId);
		// Do not show 'Bulk Update' if all the TOLs are completed
		toLineGr.addQuery('stage', 'NOT IN', ['delivered', 'cancelled']);
		toLineGr.query();
		if (toLineGr.next()) {
			return true;
		}
		return false;
	},
	showQuantityReceivedField: function () {
		var shouldShow = false;
		var toLineSysId = this.getParameter('sysparm_to_line');
		var toLine = new GlideRecord(this.ALM_TO_LINE_TABLE);
		toLine.addQuery('sys_id', toLineSysId);
		toLine.query();
		if (toLine.next()) {
			var isConsumable = (toLine.model.sys_class_name.toString() === 'cmdb_consumable_product_model' || toLine.model.asset_tracking_strategy.toString() === 'track_as_consumable');
			var qtyRemaining = toLine.getValue('quantity_remaining');
			var isQtyRemaining = gs.nil(qtyRemaining) ? 0 : parseInt(qtyRemaining, 10);
			if (isConsumable && isQtyRemaining > 1) { // show the field for consumables of multiple quantity
				shouldShow = true;
			}
		}
		return shouldShow;
	},
	type: 'TransferOrderLineBulkUpdateAjax',
});
