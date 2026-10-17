var gr = new GlideRecord('sys_security_acl_role');
gr.addQuery('sys_name', 'STARTSWITH', 'sys_cs_');
gr.addQuery('sys_name', 'ENDSWITH', '.maint');
gr.addQuery('sys_security_acl.operation', 'read');
gr.query();
while (gr.next()) {
   var name = gr.sys_name.toString();
   gr.setDisplayValue('sys_user_role', 'admin');
   gr.update();
   gs.info("update acl role [" + name + "] to [" + gr.sys_name + "]");
}
