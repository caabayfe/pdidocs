function cancel() {
	var c = gel('cancelled');
	c.value = "true";
	GlideDialogWindow.get().destroy();
}

function okHandler() {
	var total_quantity = gel('total_qty').value;
	var quantity = gel('qty').value;
	var substatus = gel('substatus').value;
	
	quantity = quantity.replaceAll(',', '');
	var regex = /^\d+$/;
	if (!quantity || !regex.test(quantity) || isNaN(quantity)) {
		alert(getMessage("Please enter a non-zero number for quantity"));
		return false;
	}

	total_quantity = parseInt(total_quantity, 10);
	quantity = parseInt(quantity, 10);

	if (quantity < 1) {
		alert(getMessage("Please enter a non-zero number for quantity"));
		return false;
	} else if (quantity > total_quantity) {
		alert(getMessage("Please enter a quantity less than or equal to the total quantity"));
		return false;
	}
	return true;
}
