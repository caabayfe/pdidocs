function showLiveFeed() {
   var box = GlideBox.get('showLiveFeed');
   if (box)
	  box.close(0);
  
    var sysId = g_form.getUniqueValue();
    var table = g_form.getTableName();
	showPopupLiveFeedList(sysId, table);

}
