function onSubmitForReview() {
	g_form.hideFieldMsg('starts');
    if(g_form.getValue('starts') == '') {
		g_form.showFieldMsg('starts', getMessage('Enter a start date before submitting for review'),'error');
		return false;  //Abort submission
    } else {
		//Call the UI Action and skip the 'onclick' function
        gsftSubmit(null, g_form.getFormElement(), 'submit_for_review'); //MUST call the 'Action name' set in this UI Action
	}
}
	
//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
    serverOnSubmitForReview();

function serverOnSubmitForReview() {
    if(current.approver == '') {
        gs.addErrorMessage(gs.getMessage('Select an approver to review this contract'));
        action.setRedirectURL(current);
    } else {
        current.substate = 'under_review';
    }
    
    current.update();
}
