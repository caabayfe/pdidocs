(function executeRule(current, previous /*null when async*/ ) {
	var topics = [];
	topics.push(current.getUniqueValue());
    var removeTemplateUtil = new RemoveTopicTemplateAssociationUtil();
    removeTemplateUtil.removeAssociation(topics);

})(current, previous);
