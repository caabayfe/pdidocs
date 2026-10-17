var answer = true;
if (current.filter_type == "blacklist" && !gs.getUser().hasRole("maint"))
	answer= false;

answer;
