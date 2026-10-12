var gr = new GlideRecord('sys_db_object');
answer= gr.get('name','sn_sd_service_group') && gs.getUser().hasRole('sn_sd.success_dashboard_admin');
