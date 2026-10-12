function onLoad() {
	var message = '';
	if (typeof GwtMessage === 'function') {
		message = new GwtMessage()
			.getMessage("Define the conditions for which the related record definitions are executed for the context record from the table selected in the 'Applies to table' field. If the conditions evaluate to false, the related record definitions are ignored.");            
	} else {
		message = getMessage("Define the conditions for which the related record definitions are executed for the context record from the table selected in the 'Applies to table' field. If the conditions evaluate to false, the related record definitions are ignored."); 
	}
	g_form.addInfoMessage(message);
}
