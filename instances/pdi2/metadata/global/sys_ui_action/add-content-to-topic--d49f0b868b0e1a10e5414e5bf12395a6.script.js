new global.TopicCategoryUtil().moveNewCategoryContentToConnectedContent(current);
var redirectUrl = "/unconnected_category_content_list.do?sysparm_query=topic=" + current.topic.toString();
action.setRedirectURL(redirectUrl);
