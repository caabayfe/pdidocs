answer = true;
var gr = new GlideRecord("sn_vsc_instance_hardening_settings");
gr.addQuery('security_check_category', current.sys_id);
gr.query();
if (gr.next()) {
    answer = false;
}
