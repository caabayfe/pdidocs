(function executeRule(current, previous /*null when async*/ ) {
	
	current.script = "(function getNotificationHeadingAndMessage(\r\n" +
        "\t/*GlideRecord of record changed to cause notification*/ target,\r\n" +
        "\t/*GlideRecord of event triggered to cause notification*/ event,\r\n" +
        "\t/*Recipient Table Name*/ recipientTable,\r\n" +
        "\t/*Recipient Sys Id*/ recipientSysId) {\r\n" +
        "\t\r\n" +
        "\t// var arrayEventParam = event.parm1.split(',');\r\n" +
        "\t// var jsonEventParam = JSON.parse(event.parm2);\r\n" +
        "\t//\r\n" +
        "\t// var recipient = new GlideRecord(recipientTable);\r\n" +
        "\t// recipient.get(recipientSysId);\r\n" +
        "\t// var messageContent = 'Dear ' + recipient.first_name + ', \\r\\n';\r\n" +
        "\t// messageContent += 'Use markdown in message content for ***formatted message***.';\r\n" +
        "\t//\r\n" +
        "\t// Return object using the below format (messageHeading is optional and messageContent is required)\r\n" +
        "\t\r\n" +
        "\treturn { messageHeading: 'formattedMessageHeading', messageContent: 'formattedMessageContent' };\r\n" +
        "\t\r\n})(target, event, recipientTable, recipientSysId);";

})(current, previous);
