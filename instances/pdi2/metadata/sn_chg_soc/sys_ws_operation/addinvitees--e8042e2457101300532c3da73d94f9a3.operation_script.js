
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal invitation payload");

	var invitation = request.body.nextEntry();
	if (!invitation)
		return new sn_ws_err.BadRequestError("invitation malformed or null");

	var chgSocSysId = invitation.chg_soc_definition;
	var recipients = invitation.recipients;
	var inviteMessage = invitation.inviteMessage;
	var sendEmail = invitation.sendEmail;
	if (!chgSocSysId || !recipients || !inviteMessage)
		return new sn_ws_err.BadRequestError("invitation malformed or null");

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(invitation.chg_soc_definition))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + invitation.chg_soc_definition + " record not found");

	return new SoCDefinition(gr).addInvitees(recipients, inviteMessage, sendEmail);
})(request, response);
