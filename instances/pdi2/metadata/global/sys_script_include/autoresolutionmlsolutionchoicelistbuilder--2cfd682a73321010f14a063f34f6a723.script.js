var AutoResolutionMLSolutionChoiceListBuilder = Class.create();
AutoResolutionMLSolutionChoiceListBuilder.prototype = {
    initialize: function() {
    },
	
	getStateChoiceList: function() {	
		var language = AutoResolutionUtil.getSessionLanguage();
		var list = new GlideChoiceList();			
		var gr = new GlideRecord("sys_choice");				
		gr.addEncodedQuery("element=state^name=ml_solution^language=" + language);				
		gr.query();				
		while (gr.next()) 			
			list.add(new GlideChoice(gr.value, gr.label));				

		return list;		
	},

    type: 'AutoResolutionMLSolutionChoiceListBuilder'
};
