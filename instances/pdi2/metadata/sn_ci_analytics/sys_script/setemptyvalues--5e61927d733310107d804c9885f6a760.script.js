(function executeRule(current, previous /*null when async*/ ) {
    if (current.custom_name == true)
        current.name = '';
    else
        current.custom_name_script = '';

    if (current.custom_type == true)
        current.type = '';
    else
        current.custom_type_script = '';
	
    if (current.apply_post_fetch_filter == false)
        current.post_fetch_filter = '';

})(current, previous);
