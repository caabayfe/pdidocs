(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
  var controller = new GTAnalyticsController();
  controller.handlePost(request.body.data, function(err, data) {
    if (err) {
      response.setBody({msg: data.msg || ''}).setStatus(500);
    } else {
      response
        .setBody(data)
        .setStatus(200);
    }
  });

})(request, response);
