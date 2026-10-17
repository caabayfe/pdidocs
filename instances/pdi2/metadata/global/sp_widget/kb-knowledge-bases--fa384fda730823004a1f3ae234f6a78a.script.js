(function() {
	data.kbBreadCrumbsMsg = gs.getMessage("Knowledge Base");
	
	// Get Knowledge Bases Associated to Portal.
	
	var kbId = $sp.getParameter('kb_id');
	var kbArr = [{id: null, title: gs.getMessage("All")}];
	data.selectedIndex =0;
	data.breadcrumb = [];
	
	// Get Accessible Knowledge Bases Associated to Portal.
	var kbIds = $sp.getKnowledgeBases();
	data.kbs = kbIds.split(',');
	
	if(data.kbs.length > 1){
		data.kbBreadCrumbsMsg = gs.getMessage("All Knowledge Bases");
	}
	
	data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";
	var kb;
	
	data.kbs.forEach(function(kbSysId, index) {
		var gr = new GlideRecord("kb_knowledge_base");
		if (gr.get(kbSysId)){
			 kb = gr.getDisplayValue("title");
		   var kbObj = {id: kbSysId, title: kb};
		   kbArr.push(kbObj);
		}
		if (kbId == kbSysId){ 
			data.selectedIndex = index + 1;
			data.kbName = kb;
		}
	});
	data.kbArr = kbArr;
	data.kbId=kbId;

	var selectedTitle = data.kbName || gs.getMessage("All");
	data.kbAriaLabel = gs.getMessage("Knowledge Bases {0}", selectedTitle);

})();
