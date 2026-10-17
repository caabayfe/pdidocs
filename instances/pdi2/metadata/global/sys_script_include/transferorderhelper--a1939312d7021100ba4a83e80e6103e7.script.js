var TransferOrderHelper = Class.create();
TransferOrderHelper.prototype = {
    initialize: function() {
    },
	
	countTransferOrderLine : function(sys_id) {
		var tol = new GlideAggregate('alm_transfer_order_line');
		tol.addQuery('transfer_order', sys_id);
		tol.addAggregate('COUNT');
        tol.query();
		
		if (tol.next() && tol.getAggregate('COUNT') > 0){
			return false;
		}else
			return true;
	},

    type: 'TransferOrderHelper'
};

TransferOrderHelper.getCalculatedQuantity = function(toiGr) {
	if (!global.AssetUtils.isAssetLoanerInTOL(toiGr)) {
		if (!toiGr.quantity_remaining.nil()) {
			return parseInt(toiGr.quantity_remaining, 10) - parseInt(toiGr.quantity_returned, 10);
		} else {
			return parseInt(toiGr.quantity_requested, 10) - parseInt(toiGr.quantity_returned, 10);
		}
	}
};
