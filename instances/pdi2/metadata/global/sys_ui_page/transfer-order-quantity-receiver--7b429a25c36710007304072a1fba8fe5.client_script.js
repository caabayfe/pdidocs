function actionOK() {
	var quantity_requested = gel("alm_transfer_order_line.quantity_requested").value;
	var quantity_received = trim(gel("quantity_received").value);
	var quantity_remaining = gel("alm_transfer_order_line.quantity_remaining").value;
	
	if(quantity_received == "") {
		alert(getMessage("Please provide the quantity received"));
		return false;
	}
	else {
		
		var requested = parseInt(quantity_requested, 10)
		var received = parseInt(quantity_received, 10);
		var remaining = parseInt(quantity_remaining, 10);
		var regNumber = new RegExp("^[0-9]+$");
		
		if(!regNumber.test(received)) {
			alert(getMessage("Quantity received should be a positive whole number"));
			return false;
		}
		else if(received > requested) {
			alert(getMessage("Quantity received cannot be greater than quantity requested"));
			return false;
		}
		else if(received > remaining) {
			alert(getMessage("Quantity received cannot be greater than quantity remaining"));
			return false;
		}
		else if(received == 0) {
			alert(getMessage("At least 1 should be received"));
			return false;
		}
	}
	var evt = event;
	setTimeout(function(evt) {
		GlideDialogWindow.get().destroy();
	}, 0.5);
	return true;
}

function cancel() {
	var c = gel('cancelled');
	c.value = "true";
	GlideDialogWindow.get().destroy();
	return false;
}
