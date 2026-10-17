(function executeRule(current, previous /*null when async*/) {
// Add your code here
	if(gs.getProperty("glide.knowman.show_rating_options",true) == "true" && gs.getProperty("glide.knowman.show_star_rating",true) == "true")
		g_scratchpad.show_disable_rating = 'true';
	else
		g_scratchpad.show_disable_rating = 'false';
	if(gs.getProperty("glide.knowman.show_rating_options",true) == "true" && gs.getProperty("glide.knowman.show_yn_rating",true) == "true")
		g_scratchpad.show_disable_helpful = 'true';
	else
		g_scratchpad.show_disable_helpful = 'false';

})(current, previous);
