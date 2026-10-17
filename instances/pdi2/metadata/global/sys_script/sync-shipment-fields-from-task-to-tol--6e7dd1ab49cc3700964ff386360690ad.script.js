(function executeRule(current, previous /*null when async*/) {
	// Sync shipment related fields (tracking number, ship date and vendor) from TOL task to TOL
	var tolGr = new GlideRecord('alm_transfer_order_line');
	if(tolGr.get(current.transfer_order_line)){
		tolGr.setValue('tracking_number', current.tracking_number);
		tolGr.setValue('ship_date', current.ship_date);
		tolGr.setValue('vendor', current.vendor);
		tolGr.update();
	}
})(current, previous);
