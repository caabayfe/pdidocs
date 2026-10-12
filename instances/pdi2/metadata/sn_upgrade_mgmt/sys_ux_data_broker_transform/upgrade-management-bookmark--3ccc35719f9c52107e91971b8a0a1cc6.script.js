function transform(input) {
	if(input.addOrRemoveBookmark === "add") {
		var request1 = new sn_ws.RESTMessageV2();
		request1.setEndpoint('http://localhost:8080/api/now/ui/favorite');
		request1.setHttpMethod('POST');

		//Eg. UserName="admin", Password="admin" for this code sample.
		// var user = 'admin';
		// var password = 'admin';

		// request.setBasicAuth(user,password);
		request1.setRequestHeader("Accept","application/json");
		request1.setRequestHeader('Content-Type','application/json');
		request1.setRequestBody(JSON.stringify(input.payload));
		gs.info(JSON.stringify(input.payload));
		var response1 = request1.execute();
		gs.info(response1.getBody());
		return response1.getBody();
	} else {
		const {sys_id} = input.payload;
		gs.info(sys_id);
		var request = new sn_ws.RESTMessageV2();
		request.setEndpoint('http://localhost:8080/api/now/ui/favorite?id='+sys_id);
		request.setHttpMethod('DELETE');

		//Eg. UserName="admin", Password="admin" for this code sample.
		// var user = 'admin';
		// var password = 'admin';

		// request.setBasicAuth(user,password);
		request.setRequestHeader("Accept","application/json");

		var response = request.execute();
		gs.info(response.getBody());
	}
}
