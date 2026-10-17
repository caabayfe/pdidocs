function onLoad() {
   var versioningRelatedFields = ['version','base_version','revised_by','display_number','latest','scheduled_publish_date'];
   var versioningRelatedLists = ['REL:fb55c83adb132200a042f278f0b8f562'];
   if(!g_scratchpad.versioning.enabled){
		for(var i=0;i<versioningRelatedFields.length;i++)
			g_form.setDisplay(versioningRelatedFields[i],false);
	    for(var i=0;i<versioningRelatedLists.length;i++)
			g_form.hideRelatedList(versioningRelatedLists[i]);
   }
   
}
