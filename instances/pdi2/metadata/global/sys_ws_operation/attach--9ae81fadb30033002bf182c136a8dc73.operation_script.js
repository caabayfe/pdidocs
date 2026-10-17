(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var EMBED_KB_LINK = 'embed_link';
    var payload = request.body.data;
    if (JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("Payload is empty");

	var relevantDoc = payload.relevant_doc.split(':');
	var attachmentType = payload.attachment_type || EMBED_KB_LINK;

	kbAttachment = new cxs_Knowledge().getArticleInfoInternal(relevantDoc[1], attachmentType);

	if (kbAttachment)
		response.setBody(kbAttachment);

})(request, response);
