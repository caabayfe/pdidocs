(function() {
	data.isValid = false;
	
	var id = $sp.getParameter('sys_id');
	if (input)
		id = input.sys_id;
	var articleGR = GlideRecord("kb_knowledge");
	articleGR.addQuery("sys_id", id).addOrCondition("number", id);
	articleGR.query();
	if (!articleGR.next())
		return;
	
	if (!articleGR.canRead())
		return;
	
	data.sys_id = articleGR.getUniqueValue();
	
	if (!articleGR.direct)
		data.isValid = true;

	if (input) {
		data.response = gs.getMessage('Thank you for your feedback');
		data.comments = "";
		data.disabled = true;

		var gr = new GlideRecord('kb_feedback');
		gr.user = gs.getUserID();
		if (input.comments)
			gr.comments = input.comments;
		if (input.rating) 
			gr.rating = input.rating;

		gr.article = data.sys_id;
		gr.insert();
	}

	data.submitMsg = gs.getMessage("Submit");
	// a kb_knowledge record can individually disable comments, otherwise
	// check widget option and possibly system properties
	data.allowFeedback = !articleGR.disable_commenting && showComments();
	data.allowRating = showStarRating();
	data.rating = 0;

	data.feedback = [];
	if (data.isValid && data.allowFeedback)
		data.feedback = getFeedback(data.sys_id);
})();

// private functions
function getFeedback(articleID) {
  var feedback = [];
  var gr = new GlideRecord("kb_feedback");
  gr.addQuery("article", articleID);
  gr.addQuery("flagged", false);
	gr.addNotNullQuery("comments");
  gr.orderByDesc('sys_created_on');
  gr.query();
  while (gr.next()) {
    var f = {};
    add('comments');
    add('rating');
    add('user');
    add('useful');
    add('sys_created_on');
    feedback.push(f);
  }

  return feedback;

  function add(name) {
    if (gr[name].getED().isDateType())
      f[name] = gr.getValue(name);
    else
      f[name] = gr[name].getDisplayValue();
  }
}

function showStarRating() {
	if (options.show_star_rating == "Yes")
		return true;

	if (options.show_star_rating == "No")
		return false;

	// check gating property for all rating options
	if (gs.getProperty("glide.knowman.show_rating_options", "true") != "true")
		return false;

	// does user have the right role?
	if (!gs.hasRole(gs.getProperty("glide.knowman.show_rating_options.roles")))
		return false;

	// check specific property for stars
	if (gs.getProperty("glide.knowman.show_star_rating", "true") != "true")
		return false;
		
	// does user have the right role?
	return gs.hasRole(gs.getProperty("glide.knowman.show_star_rating.roles"));
}

function showComments() {
	if (options.show_user_feedback == "Yes")
		return true;

	if (options.show_user_feedback == "No")
		return false;

	if (gs.getProperty("glide.knowman.show_user_feedback", "onload") == "never")
		return false;

	return gs.hasRole(gs.getProperty("glide.knowman.show_user_feedback.roles"));
}
