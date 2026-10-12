gs.log("Text Index for preserved Data - START");
var pres = new GlideRecord('clone_data_preserver');
pres.query();
while(pres.next())
{
   var txtindex = new GlideRecord('sys_dictionary');
   txtindex.addEncodedQuery('text_index!=false^internal_type=collection^name='+pres.table);
   txtindex.query();
   while(txtindex.next())
   {
      gs.log(pres.table + " to be text indexed");
      var data = new GlideRecord(pres.table);
      data.addEncodedQuery(pres.condition);
      data.query();
      gs.log("# of records " + data.getRowCount());
      while(data.next())
      {
         var table = pres.table;
         var sysID = data.sys_id;
         new GlideTSUtil().indexDocument(table, sysID);
      }
   }
}
gs.log("Text Index for preserved Data - END");
