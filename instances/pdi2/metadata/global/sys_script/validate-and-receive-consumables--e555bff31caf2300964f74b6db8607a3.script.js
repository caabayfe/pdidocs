var requested = parseInt(current.transfer_order_line.quantity_requested, 10);
var received = parseInt(current.quantity_received, 10);
var remaining = parseInt(current.transfer_order_line.quantity_remaining, 10);
var regNumber = new RegExp("^[0-9]+$");

// State = 7 = Closed Skipped
if (current.getValue('state') !== '7') {
    if (gs.nil(received)) {
        gs.addErrorMessage(getMessage("Please provide the quantity to be received"));
        current.setAbortAction(true);
    } else {
        if (!regNumber.test(received)) {
            gs.addErrorMessage(gs.getMessage("Quantity received should be a positive whole number"));
            current.setAbortAction(true);
        } else if (received > requested) {
            gs.addErrorMessage(gs.getMessage("Quantity received:{0}, cannot be greater than quantity requested:{1}", [received, requested]));
            current.setAbortAction(true);
        } else if (received > remaining) {
            gs.addErrorMessage(gs.getMessage("Quantity received:{0}, cannot be greater than quantity remaining:{1}", [received, remaining]));
            current.setAbortAction(true);
        } else if (received === 0) {
            gs.addErrorMessage(gs.getMessage("At least 1 should be received"));
            current.setAbortAction(true);
        } else if (received < remaining && remaining > 1) {
            // Perform receive operation only for partial receive of consumables
            var tor = new TransferOrderReceiver();
            tor.receiveAssets(current.transfer_order_line, received);
            // PRB1492899: If quantity recieved is less than the quantity remaining, do not close the task
            // and set it to previous task state
            if (current.getValue('state') === '3') {
				current.setValue('active', previous.getValue('active'));
                current.setValue('state', previous.getValue('state'));
            }
            gs.addInfoMessage(gs.getMessage("Task cannot be closed until full quantity has been received."));
        }
    }
}else{
    var tolGr = new GlideRecord('alm_transfer_order_line');
    if(tolGr.get(current.transfer_order_line)){
        tolGr.setValue('stage', 'received');
        tolGr.update();
    }
}
gs.setRedirect("alm_transfer_order.do?sys_id=" + current.transfer_order_line.transfer_order);
