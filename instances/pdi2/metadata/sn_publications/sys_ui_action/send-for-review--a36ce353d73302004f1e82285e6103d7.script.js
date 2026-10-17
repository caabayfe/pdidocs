var totalCount = new RecipientsListApi().getRecipientsListCount(current.recipient_lists);
var maxCount = gs.getProperty('sn_publications.max_email');

if(current.isNewRecord())
	current.insert();
if((totalCount>maxCount)&&!current.skip_notifications){
	gs.addErrorMessage(gs.getMessage("Recipient list exceeds maximum email recipient limit: {0}", maxCount));
	action.setRedirectURL(current);
}else if(!current.isNewRecord()){
	action.setRedirectURL(current);  
	current.stage = 'review';
	current.update();
}	
