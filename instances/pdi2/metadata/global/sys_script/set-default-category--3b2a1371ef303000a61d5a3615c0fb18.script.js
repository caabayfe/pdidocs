/*Make sure category exists before assigning*/
var gr = new GlideRecord('sys_app_category');
gr.addQuery('name', 'Custom Applications');  /* Should it be done using sys_id? */
gr.query();

if (gr.next())  {
	current.category = gr.sys_id;
}
