var messageDetails = new LiveMessageUtils().getMessageDetails(event.parm2);

if(messageDetails.length > 0) {
	template.print("<table id='messages' style='margin-top: 15px; width: 100%; margin: 0 auto; border-collapse: collapse; mso-table-lspace: 0;'>");
	var lastUser = false;
	
	var mentionRegex = new RegExp("@\\[[a-z0-9]{32}:([^\\]]+?)\\]", "g");
	
	messageDetails.forEach(function (messageDetail) {
		
		var formattedMessage = messageDetail.message;
		formattedMessage = formattedMessage.replace(mentionRegex, "@$1");

		formattedMessage = new ConnectEmojiEncoder().encode(formattedMessage);

		if(lastUser && lastUser !== messageDetail.profileID) {
		   template.print("<tr class='message-spacing'><td colspan='2' style='padding: 5px 0 10px;border-collapse: collapse'/></tr>");
		}
		
		if(!lastUser || lastUser !== messageDetail.profileID) {
			template.print("<tr><td valign='top' style='width: 100%;font-weight: bold;padding: 0 0 10px;border-collapse: collapse'>" + messageDetail.profile + "</td></tr>");
		}
		template.print("<tr class='message-row'><td valign='top' class='message' style='padding: 0 0 10px;border-collapse: collapse;width: 100%;'>" + formattedMessage + "</td>");

		lastUser = messageDetail.profileID;
	});
	template.print("</table>");
}
