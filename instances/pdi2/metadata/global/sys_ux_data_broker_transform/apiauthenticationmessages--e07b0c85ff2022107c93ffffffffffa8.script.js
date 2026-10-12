function transform(input){
	let successMsgObj =  gs.getSession().getProperty("oauth_entity_update_success");
	gs.getSession().clearProperty("oauth_entity_update_success");
	return successMsgObj;
}
