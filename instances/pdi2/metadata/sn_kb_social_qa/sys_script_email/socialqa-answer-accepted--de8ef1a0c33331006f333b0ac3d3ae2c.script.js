var knowledgeUtil = new global.GlobalKnowledgeUtil();
var userId = knowledgeUtil.getSessionProfile();
var userDetails = knowledgeUtil.getProfileDetails(userId);
template.print(userDetails.name + ' has accepted the answer:');
