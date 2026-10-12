function onSubmit() {
   //Type appropriate comment here, and begin script below
    var addedTags = g_form.getValue('tags');
	if(addedTags != '') {
		var activity_time = g_form.getValue('last_activity');
		var new_activity_time = parseInt(activity_time[activity_time.length-1]);
		new_activity_time = (new_activity_time+1)%10;
		new_activity_time = activity_time.substr(0, activity_time.length-1) + new_activity_time;
		g_form.setValue('last_activity', new_activity_time);
	}
}
