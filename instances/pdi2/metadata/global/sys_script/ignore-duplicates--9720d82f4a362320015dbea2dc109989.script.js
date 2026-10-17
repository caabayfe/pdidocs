removeDuplicateEmails();

function removeDuplicateEmails() {
   var myWeight = current.weight;
   var myInstance = current.instance;
   var mySubject = current.subject;
   var myBody = current.body;
   var myRecipients = current.recipients;
   var myBlindCopied = current.blind_copied;
   var myCopied = current.copied;

   // Search for any pending email with the same recipients from the same ticket
   var duplicate = new GlideRecord('sys_email');
   duplicate.addQuery('instance', myInstance);
   duplicate.addQuery('recipients', myRecipients);
   duplicate.addQuery('blind_copied', myBlindCopied);
   duplicate.addQuery('copied', myCopied);

   var typeQuery = duplicate.addQuery('type', 'send-ready');
   typeQuery.addOrCondition('type', 'send-translation-ready');

   duplicate.addQuery('weight', '>', '0');
   // include a sys_created_on query from 1 hour before now and 1 hour after now to limit the extensions we include in the query
   var s = new GlideDateTime();
   s.subtract(3600 * 1000);
   var e = new GlideDateTime();
   e.add(3600 * 1000);
   duplicate.addQuery('sys_created_on', '>=', s);
   duplicate.addQuery('sys_created_on', '<=', e);
   duplicate.query();
   while (duplicate.next()) {
      // If greater weight or have the same subject and body...ignore this duplicate
      if (duplicate.weight < myWeight) {
		 GlideSysLog.info("EMAIL." + duplicate.sys_id, "Message with sys_id " + duplicate.sys_id + " has a lower weight than message with sys_id " +
				current.sys_id + " and will be ignored.");
	 handleTranslationRecords(duplicate);
	 duplicate.type = 'send-ignored';
         duplicate.update();
      } else if (duplicate.weight > myWeight) {
         // If lesser weight, ignore me
		  GlideSysLog.info("EMAIL." + current.sys_id,"Message with sys_id " + current.sys_id + " has a lower weight than message with sys_id " +
				duplicate.sys_id + " and will be ignored.");
         current.type = 'send-ignored';
	  } else if ((duplicate.subject == mySubject) && (isBodyEquals(duplicate.body, myBody))) {
		 GlideSysLog.info("EMAIL." + duplicate.sys_id,"Message with sys_id " + duplicate.sys_id + " is a duplicate of message with sys_id " +
				current.sys_id + " and will be ignored.");
		 handleTranslationRecords(duplicate);
		 duplicate.type = 'send-ignored';
	         duplicate.update();
	  }
   }
}

function handleTranslationRecords(email) {
	if (!email || email.getValue("type") != 'send-translation-ready') {
		return;
	}
	var translations = new GlideRecord("sys_translated_email_content");
	translations.addQuery("email", email.getUniqueValue());
	translations.query();
	if (translations.getRowCount() == 0) {
		GlideSysLog.info("EMAIL." + email.sys_id, "Translations not found to mark them as send-ignored");
	} else {
		translations.setValue("type", 'send-ignored');
		translations.updateMultiple();
		GlideSysLog.info("EMAIL." + email.sys_id, "Translations found and marked them as send-ignored");
	}
}

function isBodyEquals(sourceBody, targetBody){
	if(GlideStringUtil.nil(sourceBody))
		return false;

	sourceBody = removeWatermark(sourceBody).trim();
	targetBody = removeWatermark(targetBody).trim();
	return sourceBody.equals(targetBody);
}

function removeWatermark(body){
	var w = GlideEmailWatermark();
	var watermark = w.parseMessageNumber(body);
	if(GlideStringUtil.nil(watermark))
		return body;

	return body.replace('' + watermark, "");
}
