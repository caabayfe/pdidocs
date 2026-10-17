(function executeRule(current, previous /*null when async*/ ) {

    var linkCreator = new global.AIAgentUserMetadataLinkCreator();
    linkCreator.updateMetadataLinkWithRoles(current);

})(current, previous);
