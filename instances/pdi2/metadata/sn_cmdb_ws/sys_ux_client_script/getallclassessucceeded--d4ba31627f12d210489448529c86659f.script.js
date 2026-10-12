function script({api, event}) {
    //getAllClassesSucceeded  fired in mapSearchFilterController when the classes is successfully fetched when edit mode is clicked or accessed via url
	let result = api.data.getAllCiClasses.ciClassesWithSublabel;
	api.setState("allClasses", result);
}
