(function(context, pageParams, blockcontext) {

    var isBuPluginInstalled = NAAPluginUtil.isBuPluginInstalled();
    var showWWNACard = NAASkillConfigValidator.canDisplayWWNACard();
    
    return {
        showWWNACard: isBuPluginInstalled && showWWNACard
    };
})(context, pageParams, blockcontext);
