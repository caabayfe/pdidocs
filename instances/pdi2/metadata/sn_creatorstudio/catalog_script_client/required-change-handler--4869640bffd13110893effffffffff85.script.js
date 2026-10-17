function onChange(control, oldValue, newValue, isLoading) {
    /*
    	The field value is set here, but read-only is set via 
    	catalog ui policy: 3Dfc380ec65319311074fdddeeff7b1222.
	*/
    if (newValue == 'true')
        g_form.setValue('show_questions', true);
}
