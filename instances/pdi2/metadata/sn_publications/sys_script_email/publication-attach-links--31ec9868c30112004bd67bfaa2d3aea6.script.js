pubAttachLinks();
function pubAttachLinks() {
   var sysId = current.sys_id;	
   var pub = new GlideRecord('sn_publications_publication');
   if(pub.get(sysId)){
	   if(pub.getValue('include_attach_links')==1){
		   //Check for any attachments and add attachment links if they exist
		   var gr = new GlideRecord('sys_attachment');
		   gr.addQuery('table_sys_id',sysId);
		   gr.query();
		   if (gr.hasNext()) {
			  template.print("Attachments: <br />");
			  while (gr.next()) {
				 var url = gr.getTableName() + ".do?sys_id=" + gr.getValue('sys_id'); 
				 var attachLink = '<a href="' + url +  '">' + gr.file_name + '</a>';
				 template.print(attachLink +  "<br />");
			  }
			  template.print("<hr/>");
		   }
	   }
   }	
}
