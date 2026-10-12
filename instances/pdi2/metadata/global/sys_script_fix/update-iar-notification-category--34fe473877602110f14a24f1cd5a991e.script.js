updateCategory();

function updateCategory() {
	
	var chatCategorySysId = "624ff8fe532230103296ddeeff7b121f"; //Sys Id for Chat Notification Category
	
	var iarNotificationSysIds = ["a30544195377101055eeddeeff7b123b" /*IAR*/, "24bc920653510110af71ddeeff7b1207" /*IAR Reminder*/];
	
	var gr = new GlideRecord("sys_notification");
	gr.addQuery("sys_id", "IN", iarNotificationSysIds);
	
	gr.setValue("category", chatCategorySysId);
	gr.updateMultiple();
	gs.info("Executing IAR fix script: Updated IAR notification's category to be Chat");
}
