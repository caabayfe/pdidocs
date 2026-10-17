createGuidanceOutput();

function createGuidanceOutput() {
	var uri = action.getGlideURI();
	var currentParentID = uri.get('sysparm_collectionID');
    action.setRedirectURL('/ga_guidance_output.do?sys_id=-1&sysparm_query=model_table=ga_guidance^model_id=' +
            currentParentID);
	action.setReturnURL(uri);
}
