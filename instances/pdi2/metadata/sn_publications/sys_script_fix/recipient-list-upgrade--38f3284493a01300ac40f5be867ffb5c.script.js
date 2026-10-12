var recipientListGlideRecord = new GlideRecord("sn_publications_recipients_list");
recipientListGlideRecord.query();
recipientListGlideRecord.setValue("method", "dynamic"); 
recipientListGlideRecord.updateMultiple();

var recipientslistM2MTables = ["sn_publications_recipientslist_user_m2m"];
var isCSMActive = GlidePluginManager.isActive('com.sn_customerservice');
if (isCSMActive)
	recipientslistM2MTables.push("sn_publications_recipientslist_consumer_m2m");
for(var i=0;i<recipientslistM2MTables.length;i++){
var recipientListGlideRecord = new GlideRecord(recipientslistM2MTables[i]);
recipientListGlideRecord.query();
recipientListGlideRecord.setValue("dynamically_added", true); 
recipientListGlideRecord.updateMultiple();
}
