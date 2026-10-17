action.setRedirectURL(current);
var status = new SubscriptionUtil().subscribe(current);
var translatedMessage;
if(JSUtil.notNil(status)) {
	translatedMessage = gs.getMessage('You are now subscribed to notifications for');
	gs.addInfoMessage( translatedMessage + ' ' + GlideStringUtil.escapeHTML(current.name) );
} else {
    translatedMessage = gs.getMessage('There was an error subscribing to notifications for');
	gs.addErrorMessage( translatedMessage + ' ' + GlideStringUtil.escapeHTML(current.name) );
}
