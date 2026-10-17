attachLinks();
function attachLinks() {
   //Check for any attachments and add attachment links if they exist
   var gr = new GlideRecord('sys_attachment');
   gr.addQuery('table_sys_id',current.sys_id);
   gr.query();
   if (gr.hasNext()) {
      template.print("Attachments: <br />");
      while (gr.next()) {
         var attachLink = '<a href="' + gs.generateURL(gr.getTableName(),gr.sys_id) +  '">' + gr.file_name + '</a>';
         template.print(attachLink +  "<br />");
      }
      template.print("<hr/>");
   }
}
