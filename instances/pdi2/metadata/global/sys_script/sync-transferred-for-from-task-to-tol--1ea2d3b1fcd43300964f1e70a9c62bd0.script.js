if(!(gs.nil(current.transferred_for))){
	var tolGr = new GlideRecord('alm_transfer_order_line');
	if(tolGr.get(current.transfer_order_line)){
		tolGr.transferred_for = current.transferred_for;
		tolGr.update();
	}
}
