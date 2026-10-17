(function(context, pageParams, blockcontext) {
    var data = {};
    data.language = blockcontext.modelPrimaryLanguage;
    data.displayName = blockcontext.modelName;
    data.category = blockcontext.currentTab;
    data.modelDomain = blockcontext.modelDomain.reduce(function(domains, item) {
        return domains.concat(item.value);
    }, []).join(',') || '';
    data.ct = 0.6;
    data.description = blockcontext.modelShortDescription;
    var result = global.ImportNLUModel.importModel(data);

    return {
        modelLink: '/$nlu-studio.do#/model-overview/' + result.modelId,
        stagingTable: result.stageTable,
        csvModelId: result.modelId,
        csvModelCreation: 'created'
    };

})(context, pageParams, blockcontext);
