(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var aesUtils = new AesUtils();
	var topics = [];
	var content = [];

    var grTopics = new GlideRecord('sn_app_eng_studio_resources_content_topic');
	grTopics.orderBy('order');
	grTopics.query();
	while (grTopics.next()) {
		var topicObj = aesUtils.getObjectFromGlideRecord(grTopics, ['sys_id', 'value', 'order']);
		topicObj.label = grTopics.getDisplayValue('label');
		topics.push(topicObj);
	}
	
	var grContent = new GlideRecord('sn_app_eng_studio_resources_content');
	grContent.query();

	while (grContent.next()) {
		var contentItem = aesUtils.getObjectFromGlideRecord(grContent, ['sys_id', 'content_url', 'type', 'topics', 'order']);
		contentItem.title = grContent.getDisplayValue('title');
		contentItem.description = grContent.getDisplayValue('description');
		contentItem.topicLabels = grContent.getDisplayValue('topics');
		contentItem.icon = aesUtils.getUserImageString(grContent, 'icon');
		contentItem.image = aesUtils.getUserImageString(grContent, 'image');
		content.push(contentItem);
	}
	
	response.setStatus(200);
	response.setBody({
		topics: topics,
		content: content
	});

})(request, response);
