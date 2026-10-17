var EMBED_KB_LINK = 'embed_link';
var EMBED_KB_ARTICLE = 'embed_article';

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var payload = request.body.data;

	// If there's no payload and no query parameter we can return an error.
	if (JSUtil.isEmpty(payload))
		return new sn_ws_err.BadRequestError("No Query String provided");

	if (payload.displayed_on.startsWith('workspace')) {
		var sourceDoc = payload.source_doc.split(':');
		var relevantDoc = payload.relevant_doc.split(':');
		var action = payload.relevance;
		var relevant = payload.relevant;
		var relevantDocTable = relevantDoc[0];
		//PRB1366409: Treat answer as a question to fetch the link of the entire discussion.
		if(relevantDocTable && relevantDocTable === 'kb_social_qa_answer')
			relevantDocTable = 'kb_social_qa_question';
		
		writeToActivityStream(sourceDoc[0], sourceDoc[1], relevantDocTable, relevantDoc[1], action, relevant);
	}

	var json = new JSON();
	var JSONObject = json.encode(payload);
	var feedbackRequest = new SNC.FeedbackRequest().fromJSON(JSONObject);
	var feedbackResponse = feedbackRequest.submit();
	var feedbackResponseObj = json.decode(feedbackResponse.toJSON());
	response.setBody(feedbackResponseObj);

})(request, response);

function writeToActivityStream(sourceDocTable, sourceDocId, relevantDocTable, relevantDocId, action, relevant) {
	var content = null;
	var field = null;
	var attachment = null;
	var currentUser = gs.getUser();
	if (relevantDocTable === 'kb_knowledge' && action === 'attach') {
		//attach action is handled by feedback on modal submit. 
		if (!relevant) {
			attachment = new cxs_Knowledge().getArticleInfoInternal(relevantDocId, EMBED_KB_LINK);
			content = gs.getMessage("{0} unattached the following article:\n{1}", [currentUser.getDisplayName(), attachment.article.content]);
			field = 'work_notes';
		}
	} else if (action === 'This helped') {
		var itemType = "";
		if (relevantDocTable === 'kb_knowledge') {
			attachment = new cxs_Knowledge().getArticleInfoInternal(relevantDocId, EMBED_KB_LINK);
			itemType = gs.getMessage("article");
		} else if (relevantDocTable === 'kb_social_qa_question' || relevantDocTable === 'kb_social_qa_answer') {
			attachment = new cxs_Knowledge().getSocialQAInternal(relevantDocTable,relevantDocId, EMBED_KB_LINK);
			itemType = gs.getMessage('{0}', attachment.contentType);
		} else if (relevantDocTable === 'sn_communities_blog') {
			attachment = new cxs_Knowledge().getCommunityBlogInternal(relevantDocId, EMBED_KB_LINK);
			itemType = gs.getMessage("blog");
		} else
			return null;

		if (relevant)
			content = gs.getMessage("{0} marked the following {1} as helpful:\n{2}", [currentUser.getDisplayName(), itemType, attachment.article.content]);
		else
			content = gs.getMessage("{0} no longer finds the {1} helpful:\n{2}", [currentUser.getDisplayName(), itemType, attachment.article.content]);
		field = 'work_notes'; //This help always go into work_note
	}
	if (!content)
		return null;

	/*
	 * Decide where to send the attachment content:
	 * * if, attaching an article, return to client, for further actions
	 * * otherwise, directly into activity stream
	 * * return null means do nothing on client side
	 */
	if (!(relevantDocTable === 'kb_knowledge' && action === 'attach' && relevant))
		new cxs_ActivityStream().insertActivity(sourceDocTable, sourceDocId, content, field);
	return null;
}
