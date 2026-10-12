var gr = new GlideMultipleUpdate("cmdb_ci_vmware_instance");
gr.addQuery('install_status', '7');
gr.addQuery('operational_status', '1');
gr.setValue('operational_status', '2');
gr.execute();
