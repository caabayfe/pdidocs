function getRefColumnDictionary(){
   var gr = new GlideRecord("sys_dictionary");
   gr.addQuery("name", current.table);
   gr.addQuery("reference", current.parent.table);
   gr.query();
   var ids = "";
   while(gr.next()){
      if (ids.length > 0)
         ids += ",";
      ids += gr.sys_id;
   }
   return 'sys_idIN' + ids;
}
