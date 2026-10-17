var timeComp = new TransferOrderDateTimeAjax();
if (timeComp.isDateBeforeNow(current.delivery_by_date)) {
	gs.addErrorMessage(gs.getMessage('Choose a delivery date in the future'));
	current.setAbortAction(true);
}
