(function() {
	data.isValidArticle = false;

	if (gs.getProperty("glide.knowman.show_yn_rating", "true") != "true")
		return;

	if (!gs.hasRole(gs.getProperty("glide.knowman.show_yn_rating.roles")))
		return;

	if (gs.getProperty("glide.knowman.show_rating_options", "true") != "true")
		return;

	if (!gs.hasRole(gs.getProperty("glide.knowman.show_rating_options.roles")))
		return;

	var id = $sp.getParameter("sys_id");
	if (!id)
		return;

	var articleGR = GlideRecord("kb_knowledge");
	articleGR.addQuery("sys_id", id).addOrCondition("number", id);
	articleGR.query();
	if (!articleGR.next())
		return;

	if (!articleGR.canRead())
		return;

	data.isValidArticle = true;
	data.sys_id = articleGR.getUniqueValue();
	data.percent = getPercent(articleGR);
	data.title = options.title || gs.getMessage("Helpful?");
	data.submittingMsg = gs.getMessage("Submitting");

	if (input) {
		data.response = options.response || gs.getMessage('Thank you');
		var gr = new GlideRecord('kb_feedback');
		gr.user = gs.getUserID();
		if (input.state == "useful_yes")
			gr.useful = 'yes';
		else
			gr.useful = 'no';
		gr.article = input.sys_id;
		gr.insert();
	}

})();

function getPercent(articleGR) {
	var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";
	var kbUseful = new GlideAggregate("kb_feedback");
	if (versioningEnabled)
		kbUseful.addQuery("article.summary", articleGR.getValue("summary")); // support versioning
	else
		kbUseful.addQuery("article", data.sys_id); // versioning not enabled
	kbUseful.addNotNullQuery("useful");
	kbUseful.addAggregate("COUNT");
	kbUseful.groupBy("useful");
	kbUseful.query();

	var total = 0;
	var yes = 0;
	while (kbUseful.next()) {
		total += Number(kbUseful.getAggregate("COUNT"));
		if (kbUseful.getValue("useful") == "yes")
			yes = kbUseful.getAggregate("COUNT");
	}
	return total ? Math.round((yes / total) * 100) : -1;
}
