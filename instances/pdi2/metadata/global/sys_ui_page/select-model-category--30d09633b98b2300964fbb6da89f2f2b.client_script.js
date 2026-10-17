function actionOK(){
    var cat_id = gel('cmdb_model_category').value;
    
    if (cat_id == '' || cat_id == 'null' || cat_id == 'undefined') {
        g_form.addErrorMessage(getMessage("Please select a catalog category to link item too"));
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
