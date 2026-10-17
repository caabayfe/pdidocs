function actionOK(){
    var cat_id = gel('sc_cat_item').value;
    if (cat_id == '') {
        alert(getMessage("Please select a catalog item to link item too"));
        return false;
	}
	var c = gel('cancel_or_submit');
    c.value = "submit";
	return true;
}

function cancel(){
	var c = gel('cancel_or_submit');
    c.value = "cancel";
	return true;
}
