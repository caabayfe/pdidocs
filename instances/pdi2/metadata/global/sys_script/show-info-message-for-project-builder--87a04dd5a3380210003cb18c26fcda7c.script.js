(function executeRule(current, previous /*null when async*/) {

	var grEntity = new GlideRecord("promin_project_entity");
	grEntity.addQuery("project", current.getUniqueValue());
	grEntity.query();
	var link = "";
	if(grEntity.hasNext()){
		link = "<a href=/now/experience/promin/promin_project/"+current.getUniqueValue()+"/overview>";
	}else{
		link = "<a href=now/experience/promin/promin_project/-1/set-objectives>";
	}
	gs.addInfoMessage(gs.getMessage("Try using the project builder {0}here</a> to leverage additional features and get guidance on configuring your project.", link));
})(current, previous);
