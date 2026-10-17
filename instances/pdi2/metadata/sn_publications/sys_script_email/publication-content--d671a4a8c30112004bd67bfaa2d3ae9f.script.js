pubContent();
function pubContent() {
   var sysId = current.sys_id;	
   var content = '';
   var pub = new GlideRecord('sn_publications_publication');
   if(pub.get(sysId)){
	   if(pub.getValue('content_type')=='html'){
		   //Display html
		   content = pub.getValue('text');
	   }else if(pub.getValue('content_type')=='wiki'){
		   //Display wiki
		   content = pub.getValue('wiki');
	   }   
	   if(!gs.nil(content)){
	      template.print(content);
	    }
   }	
}
