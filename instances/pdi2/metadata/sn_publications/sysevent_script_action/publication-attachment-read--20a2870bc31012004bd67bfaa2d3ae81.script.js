var publication_id = current.table_sys_id;//the publication
var user_id = event.user_id;//the user who read the attachment 

var tablename = current.table_name;
var event_id = event.sys_id;
var sysid = current.sys_id;

var gr = new GlideRecord('sn_publications_publication_contact_m2m');
//assume publication+contact combination is unique in the table
gr.addQuery('publication',publication_id);
gr.addQuery('user',user_id);
gr.addQuery('viewed_attachment',false);
gr.query();
if(gr.next()){
	gr.viewed_attachment = true;
    gr.update();
}
