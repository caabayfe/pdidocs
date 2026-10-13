function onSubmit() {
   
	g_form.hideAllFieldMsgs();
	
	var intValue = -5;
	var flag = true;
	occursCreateAlert = g_form.getValue('create_alert_freq');
	occursCloseAlert = g_form.getValue('close_alert_freq');
	intervalCreateAlert = g_form.getValue('create_alert_int');
	intervalCloseAlert = g_form.getValue('close_alert_int');
	createOperator = g_form.getValue('create_alert_op');
	closeOperator = g_form.getValue('close_alert_op');
	createValue = g_form.getValue('create_alert_value');
	closeValue = g_form.getValue('close_alert_value');
	var errorMsg = 'Value cannot be negative or decimal';
	
	if(occursCreateAlert == ''){
		g_form.setValue('create_alert_freq', 1);  
	}
	else {
		intValue = occursCreateAlert;
		if(intValue <= 0) {
			g_form.showErrorBox('create_alert_freq', 'Value cannot be zero or negative or decimal', true); 
			flag = false;
		}
	}
	
	if(occursCloseAlert == ''){
		g_form.setValue('close_alert_freq', 1);  
	}
	else {
		intValue = occursCloseAlert;
		if(intValue < 0) {
			g_form.showErrorBox('close_alert_freq', errorMsg, true); 
			flag = false;
		}
	}
	
	
	if(intervalCreateAlert == ''){
		g_form.setValue('create_alert_int', 90);  
	}
	else {
		intValue = intervalCreateAlert;
		if(intValue < 0) {
			g_form.showErrorBox('create_alert_int', errorMsg, true); 
			flag = false;
		}
	}

	
	if(intervalCloseAlert == ''){
		g_form.setValue('close_alert_int', 90);  
	}
	else {
		intValue = intervalCloseAlert;
		if(intValue < 0) {
			g_form.showErrorBox('close_alert_int', errorMsg, true); 
			flag = false;
		}
	}
	/*
	operators:
	!=	6
	>	 1
	>=	2
	<	 3
	<=	4
	=	 5
	idle  7
	*/
	
	
	var floatValueCreate= createValue;
	var floatValueClose = closeValue;
	//Create Operator is !=
	if(createOperator == "6"){
		if(closeOperator == "5"){
			if(floatValueCreate != floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	//Create Operator is >
	if(createOperator ==  "1" ){
		if (closeOperator == "5"){
			if(floatValueCreate < floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "3" || closeOperator == "4"){
			if (floatValueCreate < floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	//Create Operator is >=
	if(createOperator == "2"){
		if (closeOperator == "5"){
			if(floatValueCreate <= floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "3"){
			if (floatValueCreate < floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "4"){
			if (floatValueCreate <= floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	//Create Operator is <
	if(createOperator == "3"){
		if (closeOperator == "5"){
			if(floatValueCreate > floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "1" || closeOperator == "2"){
			if (floatValueCreate > floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	//Create Operator is <=
	if(createOperator == "4"){
		if (closeOperator == "5"){
			if(floatValueCreate >= floatValueClose)
				flag = alertOverlap();
		} else if(closeOperator == "1") {
			if (floatValueCreate > floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "2"){
			if (floatValueCreate >= floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	//Create Operator is =
	if(createOperator == "5"){
		if(closeOperator == "0"){
			if(floatValueCreate != floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "1"){
			if(floatValueCreate > floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "2"){
			if(floatValueCreate >= floatValueClose)
				flag = alertOverlap();	
		}else if(closeOperator == "3"){
			if(floatValueCreate < floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "4"){
			if(floatValueCreate <= floatValueClose)
				flag = alertOverlap();
		}else if(closeOperator == "5"){
			if(floatValueCreate == floatValueClose)
				flag = alertOverlap();	
		}else if(closeOperator != '' && closeOperator != "7")
			flag = alertOverlap();
	}
	
	if(closeOperator !='' && closeOperator != "7"){
		intValue = occursCloseAlert;
		if(intValue == 0){
			flag = false;
			g_form.showErrorBox('close_alert_freq', 'Occurs cannot be 0', true);
		}
	}
	
	if(closeOperator !=''){
		intValue = intervalCloseAlert;
		if(intValue == 0){
			flag = false;
			g_form.showErrorBox('close_alert_int', 'Seconds cannot be 0', true);
		}
	}
	
	return flag;

}

function alertOverlap(){
	g_form.showErrorBox('create_alert_op', 'Create criteria overlaps with close criteria', true); 
	return false;
}
