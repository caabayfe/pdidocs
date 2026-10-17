var result = new TransferOrderHelper().countTransferOrderLine(current.sys_id);
if (result == false){
	gs.addErrorMessage(gs.getMessage('Cannot change the From Stockroom if the Transfer Order has one or more Transfer Order Lines'));
	current.setAbortAction(true);
}
