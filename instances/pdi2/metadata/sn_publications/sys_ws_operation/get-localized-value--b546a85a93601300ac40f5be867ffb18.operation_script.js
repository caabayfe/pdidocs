(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var needToConvertMessages=request.body.data;
	var returnlist={};
	var messages = {
		Cancel: gs.getMessage("Cancel"),
		Continue: gs.getMessage("Continue"),
		Done: gs.getMessage("Done"),
		Users: gs.getMessage("Users"),
		Contacts: gs.getMessage("Contacts"),
		Consumers: gs.getMessage("Consumers"),
		Accounts: gs.getMessage("Accounts"),
		User: gs.getMessage("User"),
		Contact: gs.getMessage("Contact"),
		Consumer: gs.getMessage("Consumer"),
		Account: gs.getMessage("Account"),
		Close: gs.getMessage("Close"),
		Success: gs.getMessage("Success"),
		Failure: gs.getMessage("Failure"),
		Uploading: gs.getMessage("Uploading"),
		"Show Details": gs.getMessage("Show Details"),
		"Uploading File": gs.getMessage("Uploading File"),
		"Number of users found:": gs.getMessage("Number of users found:"),
		"Number of users not found:": gs.getMessage("Number of users not found:"),
		"The file must contain user_name or email as the header of the first column.": gs.getMessage("The file must contain user_name or email as the header of the first column."),
		"There were errors with the file you uploaded": gs.getMessage("There were errors with the file you uploaded"),
		"There were no errors with the file you uploaded": gs.getMessage("There were no errors with the file you uploaded"),
		"Would you like to continue your upload?": gs.getMessage("Would you like to continue your upload?"),
		"Uploading file of ": gs.getMessage("Uploading file of "),
		"Valid": gs.getMessage("Valid"),
		"Not Valid": gs.getMessage("Not Valid"),
		"were added to the recipients list": gs.getMessage("were added to the recipients list")
	};
		
		for(var i=0;i<needToConvertMessages.list.length;i++){
			var msg = [];
			msg.push(needToConvertMessages.list[i].toString());
	returnlist[needToConvertMessages.list[i].toString()]=messages[msg];
		}
		return returnlist;
		
	})(request, response);
