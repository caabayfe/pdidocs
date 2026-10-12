var TransferOrderLineHandler = Class.create();
TransferOrderLineHandler.prototype = {
	initialize: function() {},

	triggerAction: function(transferOrderLineId, stage) {
		var transferOrderLineGr = new GlideRecord('alm_transfer_order_line');

		// Attempt to get the record and validate the result
		if (!transferOrderLineGr.get(transferOrderLineId)) {
			gs.error('Invalid sysID provided for Transfer Order Line: ' + transferOrderLineId);
			return; // Exit early if the sysID is invalid
		}

		switch (stage) {
		case 'draft':
			this.triggerDraftAction(transferOrderLineGr);
			break;
		case 'requested':
			this.triggerRequestedAction(transferOrderLineGr);
			break;
		case 'received':
			this.triggerReceivedAction(transferOrderLineGr);
			break;
		case 'delivered':
			this.triggerDeliveredAction(transferOrderLineGr);
			break;
		case 'shipment_preparation':
			this.triggerShipmentPreparationAction(transferOrderLineGr);
			break;
		case 'in_transit':
			this.triggerInTransitAction(transferOrderLineGr);
			break;
		default:
			gs.warn('No matching stage found for Transfer Order Line (Sys ID: ' + transferOrderLineId + ') with stage: ' + stage);
			break;
		}
	},

	triggerDraftAction: function(transferOrderLineGr) {
		var tolModelCategory = transferOrderLineGr.model.cmdb_model_category;
		// eslint-disable-next-line max-len
		if (transferOrderLineGr.transfer_order.from_stockroom.toString() === transferOrderLineGr.transfer_order.to_stockroom.toString()) {
			new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'received', transferOrderLineGr);
		} else {
			new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'requested', transferOrderLineGr);
		}
	},

	triggerRequestedAction: function(transferOrderLineGr) {
		var tolModelCategory = transferOrderLineGr.model.cmdb_model_category;
		new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'shipment_preparation', transferOrderLineGr);
	},

	triggerReceivedAction: function(transferOrderLineGr) {
		if (transferOrderLineGr.getValue('stage') === 'received') {
			var tolModelCategory = transferOrderLineGr.model.cmdb_model_category;
			new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'delivered', transferOrderLineGr);
		}
	},

	triggerDeliveredAction: function() {

	},

	triggerShipmentPreparationAction: function(transferOrderLineGr) {
		var tolModelCategory = transferOrderLineGr.model.cmdb_model_category;
		new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'in_transit', transferOrderLineGr);
	},

	triggerInTransitAction: function(transferOrderLineGr) {
		var tolModelCategory = transferOrderLineGr.model.cmdb_model_category;
		new TransferOrderLineTemplateTaskAPI().findAndCreateTaskWithTolGr(tolModelCategory, 'received', transferOrderLineGr);
	},

	type: 'TransferOrderLineHandler',
};
