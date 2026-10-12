try {
    var categoryField = event.parm1;
    var categoryList = event.parm2.split(',');
    var disAssociationString = categoryField.split(',')[1];
    categoryField = categoryField.split(',')[0];
    var topicId = current.sys_id;
    var contentAssociationUtil = new global.ContentAssociationUtilAjax();
    if(!disAssociationString){
      if (categoryField == "kb_category")
        contentAssociationUtil.associateKnowledgeToTopic(topicId, categoryField, categoryList);
      else if (categoryField == "sc_category")
        contentAssociationUtil.associateCatalogToTopic(topicId, categoryField, categoryList);
    }else{
      if (categoryField == "kb_category")
        contentAssociationUtil.disassociateKnowledgeFromTopic(topicId, categoryList);
      else if (categoryField == "sc_category")
        contentAssociationUtil.disassociateCatalogsFromTopic(topicId, categoryList);
    }
} catch (e) {
    gs.info(gs.getMessage("There was a problem in connecting content to topic"));
}
