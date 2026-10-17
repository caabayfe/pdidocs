var uri = action.getGlideURI();
var path = uri.get('sysparm_collection_related_file') + '.do';
uri.set('sys_id', '-1');
uri.set('sysparm_link_collection', uri.get('sys_target'));
uri.set('sysparm_record_list', null);
path = checkWizard(uri, path);

if (path) {
	checkM2MNew(uri);
	action.setRedirectURL(uri.toString(path));
}
action.setNoPop(true);

function checkWizard(uri, path) {
   var already = uri.get('WIZARD:action');
   if (already == 'follow')
   return null;
   
   var wizID = new GlideappWizardIntercept(path).get();
   if (!wizID)
      return path;
   
   uri.set('sysparm_parent', wizID);
   uri.deleteParmameter('sysparm_referring_url');
   uri.deleteMatchingParameter('sysparm_list_');
   uri.deleteMatchingParameter('sysparm_record_');
   uri.deleteParmameter('sys_is_list');
   uri.deleteParmameter('sys_is_related_list');
   uri.deleteParmameter('sys_submitted');
   uri.deleteParmameter('sysparm_checked_items');
   uri.deleteParmameter('sysparm_ref_list_query');
   uri.deleteParmameter('sysparm_current_row');
 
   uri.set('sysparm_referring_url', uri.toString());
   uri.deleteMatchingParameter('fancy.');
   uri.deleteMatchingParameter('sys_rownum');
   uri.deleteMatchingParameter('sysparm_encoded');
   uri.deleteMatchingParameter('sysparm_query_encoded');
   uri.deleteParmameter('sysparm_refer');

   return 'wizard_view.do';
}

// See if the related field has a m2m_new attribute and if so, use it as the sysparm_query
function checkM2MNew(uri) {
   var m2mField = uri.get('sysparm_collection_related_field');
   if (!m2mField)
      return;

   var td = GlideTableDescriptor.get(current.getTableName());
   if (!td)
      return;
      
   var ed = td.getElementDescriptor(m2mField);
   if (!ed)
      return;
      
   var m2mNew = ed.getAttribute('m2m_new');
   if (m2mNew)
      uri.set('sysparm_query', m2mNew);   
}
