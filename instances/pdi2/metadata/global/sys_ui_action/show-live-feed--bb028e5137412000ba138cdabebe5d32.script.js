function showLiveFeedList() {
   var sysId = g_sysId;
   if(typeof GlideBox !== 'undefined' && GlideBox) {
      var box = GlideBox.get('showLiveFeed_' + sysId);
      if (box) {
         box.close(0);
      }
   }
   var table = g_list.getTableName();
   showPopupLiveFeedList(sysId, table);
}
