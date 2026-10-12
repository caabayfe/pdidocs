if (gs.hasRole("sp_admin") || gs.hasRole("sn_hr_sp.esc_admin"))
    answer = true;
else {
    var field = root_rule.replace("sn_ex_sp_favorite_content_type.", "");
	if(field === "name")
		answer = true;
	else
		answer = false;
}
