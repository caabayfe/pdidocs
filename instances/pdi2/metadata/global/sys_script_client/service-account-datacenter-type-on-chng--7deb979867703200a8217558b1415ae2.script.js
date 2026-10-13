function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if( g_form.getValue( "datacenter_type") == "cmdb_ci_vcenter_datacenter" || g_form.getValue( "datacenter_type") == "cmdb_ci_openstack_datacenter" || g_form.getValue( "datacenter_type") == "cmdb_ci_oci_datacenter"){
		g_form.setMandatory( "datacenter_url", true);
	}else{
		g_form.setMandatory( "datacenter_url", false);
	}
   
}
