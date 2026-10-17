answer = getAttachmentCreateAnswer();

function getAttachmentCreateAnswer() {
   if (current.table_name.nil())
      return true;
   
   // If the attachment is from live feed,
   // allow it to be attached.
   if (current.table_name == 'live_profile')
      return current.table_sys_id == new GlideappLiveProfile().getID();
   
   // Remove prefix
   var tableName = current.table_name;
   var invisible_prefix = "invisible.";
   if (tableName.startsWith("invisible."))
      tableName = tableName.substring(10);

	// First check if the parent record exists at all, by-passing all checks
	if (!GlideSysAttachment.isParentValid(current))
		return true; // If the parent record doesn't exist, return true as a fail-safe
	
	var parentRecord = new GlideRecord(tableName);
	if (!parentRecord.get(current.table_sys_id))
		return false; // If we get here, then access is being blocked by a before query BR
	
	// outgoing emails created by Email Client
	if (current.table_name == "sys_email" && parentRecord.weight == -1 && parentRecord.type == "send-ignored")
		return true;
	
	return parentRecord.canWrite();
}
