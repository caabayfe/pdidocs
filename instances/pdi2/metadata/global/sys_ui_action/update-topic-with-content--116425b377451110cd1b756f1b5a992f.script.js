var topicUtil = new global.TopicCategoryUtil();
  if (current.update_type == "added") {
      topicUtil.moveNewCategoryContentToConnectedContent(current);
  } else if (current.update_type == "removed") {
      topicUtil.removeCategoryContentFromConnectedContent(current);
  }
var redirectUrl = "/unconnected_category_content_list.do?sysparm_query=topic=" + current.topic.toString();
action.setRedirectURL(redirectUrl);
