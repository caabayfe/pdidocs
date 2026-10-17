var cGr = new GlideRecord('alm_consumable');
    if (cGr.get(consumable) && cGr.canRead()) {

    if (cancelled == "false") {
	var newStockroom = '';
	if (current_stockroom == '') {
		newStockroom = stockroom;
	}
	new global.Consumables().cancelFromDisposal(consumable, status, substatus, newStockroom, current_stockroom);
	}
	response.sendRedirect("alm_consumable.do?sys_id=" + consumable);

}else{
	gs.addErrorMessage(gs.getEscapedMessage("You aren't authorized to access the record."));
}	
