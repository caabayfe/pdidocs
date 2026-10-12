var gr = new GlideRecord('sys_user_group');
gr.addQuery('sys_id', current.sys_id);
gr.addEncodedQuery('active=true^EQ');
gr.query();
if (gr.getRowCount() > 0) {
   new AssessmentUtils().checkRecord(current, 'ee910ea7bf2201007a6d257b3f07398c');
}
