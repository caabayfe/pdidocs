// If User also has writer role, they can see Templated Response even if they are not in 
// a visibility group; otherwise, user's group visibility determines if they can see response.
var noteTemplateCheck =  new sn_templated_snip.NoteTemplateCheck();
var table = current.table.toString();
var isHRTable = table.startsWith('sn_hr');

answer = ( gs.getUser().hasRole('sn_templated_snip.template_snippet_writer') || 
	noteTemplateCheck.isUserGroupVisible(current) ) &&
// 	Check read access for HR response template
//  NOTE: HR table check is for backwards compatibility as the Snippets code moves into Global 
//  scope during New York. Please do not remove.
	( isHRTable? noteTemplateCheck.canAccessHRResponseTemplate(table, 'read') : true );
