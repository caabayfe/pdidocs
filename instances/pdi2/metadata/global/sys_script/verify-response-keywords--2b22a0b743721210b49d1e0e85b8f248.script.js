(function executeRule(current, previous /*null when async*/ ) {
    var channel = current.channel_type ? current.channel_type.type : "";
    var isError = false;
    if (channel != "slack" && channel != "mobile_notification" && current.getValue("accept_keyword") == current.getValue("reject_keyword")) {
        gs.addErrorMessage(gs.getMessage("The Accept keyword cannot be the same as the Reject keyword."));
        isError = true;
    }
    if(channel == 'voice')
    {
        var notAllowedRegexString = /^(?!\d+$).*/;
        var notAllowedRegex = new RegExp(notAllowedRegexString);
        if(notAllowedRegex.test(current.getValue("accept_keyword")) || notAllowedRegex.test(current.getValue("reject_keyword")))
        {
            gs.addErrorMessage(gs.getMessage("Accept and Reject keywords should only contain numeric characters."));
            isError = true;
        }
    }

    var userAccInstruction = current.getValue("user_accept_instruction");
    var userRejInstruction = current.getValue("user_reject_instruction");
    var catchAllAccInstruction = current.getValue("catch_all_accept_instruction");
    var catchAllRejInstruction = current.getValue("catch_all_reject_instruction");
    var accVariable = channel != "sms" ? "{accept_keyword}" : "{message_number}{accept_keyword}";
    var rejVariable = channel != "sms" ? "{reject_keyword}" : "{message_number}{reject_keyword}";

    if (userAccInstruction.indexOf(accVariable) == -1 || catchAllAccInstruction.indexOf(accVariable) == -1) {
        gs.addErrorMessage(gs.getMessage("The User and Catch-all accept instructions must include the {0} placeholder.", accVariable));
        isError = true;
    }

    if (userRejInstruction.indexOf(rejVariable) == -1 || catchAllRejInstruction.indexOf(rejVariable) == -1) {
        gs.addErrorMessage(gs.getMessage("The User and Catch-all reject instructions must include the {0} placeholder.", rejVariable));
        isError = true;
    }
    if (isError)
        current.setAbortAction(true);

})(current, previous);
