
(function(context, pageParams, blockcontext){
	var modelDomains = GlideChoiceList.getChoiceList("sys_nlu_model", "model_domain");
    var modelDomainsChoices = [];
    for (var i = 0; i < modelDomains.getSize(); i++){
        if(modelDomains.getChoice(i).getValue()){
            modelDomainsChoices.push({"label":modelDomains.getChoice(i).getLabel(), "value": modelDomains.getChoice(i).getValue(), "id": modelDomains.getChoice(i).getValue()});
        }
    }
	return modelDomainsChoices;
})(context, pageParams, blockcontext);
