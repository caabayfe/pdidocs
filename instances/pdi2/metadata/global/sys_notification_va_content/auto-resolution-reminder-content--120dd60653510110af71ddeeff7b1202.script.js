(function getNotificationHeadingAndMessage(
    /*GlideRecord of record changed to cause notification*/ target,
    /*GlideRecord of event triggered to cause notification*/ event,
    /*Recipient Table Name*/ recipientTable,
    /*Recipient Sys Id*/ recipientSysId) {
  
  // var arrayEventParam = event.parm1.split(',');
  // var jsonEventParam = JSON.parse(event.parm2);
  //
  // var recipient = new GlideRecord(recipientTable);
  // recipient.get(recipientSysId);
  // var messageContent = 'Dear ' + recipient.first_name + ', \r\n';
  // messageContent += 'Use markdown in message content for ***formatted message***.';
  //
  // Return object using the below format (messageHeading is optional and messageContent is required)
  
  return {messageHeading:'formattedMessageHeading', messageContent:'formattedMessageContent'};
  
})(target, event, recipientTable, recipientSysId);
