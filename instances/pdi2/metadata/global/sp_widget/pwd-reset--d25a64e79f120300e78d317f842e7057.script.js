(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */

    /* Note: If GlideRecord/GlideRecordSecure is called, please follow the below guidelines,

	1. If possible, set the widget non-public, i.e. "<public>false<public>". Assess if the widget needs to be really public.
	2. If possible, restrict the table names passed into GlideRecord/GlideRecordSecure. This can be done by completely hardcoding the table name.
	3. As a last resort, ensure the table accessed by the GlideRecord/GlideRecordSecure object are explicitly defined in the "Public Table Allow List" in related list section of the widget. And also make security API call before the GlideRecord/GlideRecordSecure call.
	
	Below is sample example code for calling secure API
	-----------------------------------------------------------------------------------------------------------------------------------------
	if(!new global.SPWidgetAccessControl().hasPublicAccess(options.table, $sp, options, input)){
		gs.warn("Deny access to table which is not public: " + options.table);
		data.isValid = false;
		return;
	}
	var gr = new GlideRecordSecure(options.table);*/

})();
