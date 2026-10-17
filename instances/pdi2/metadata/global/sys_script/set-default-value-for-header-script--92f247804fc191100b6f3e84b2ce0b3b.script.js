(function executeRule(current, previous /*null when async*/ ) {
	
	current.header_customization_script = "(function getNotificationHeadingAndMessage(\r\n" +
		"\t/*GlideRecord of record changed to cause notification*/ target,\r\n" +
		"\t/*GlideRecord of event triggered to cause notification*/ event,\r\n" +
		"\t/*Recipient Table Name*/ recipientTable,\r\n" +
		"\t/*Recipient Sys Id*/ recipientSysId) {\r\n" +
		"\t\r\n" +
		"\treturn { cardHeading: '', cardLinkText: '', cardLinkUrl: '' };\r\n" +
		"\t\r\n})(target, event, recipientTable, recipientSysId);";

})(current, previous);
