var current_view = g_uri.get("sysparm_view");

if (current_view == "sc_ic_item_staging_design" || current_view == "sc_cat_item_designer")
	g_uri.set("sysparm_view", "sc_ic_task_defn_design");

var answer = g_uri.toString();
answer;
