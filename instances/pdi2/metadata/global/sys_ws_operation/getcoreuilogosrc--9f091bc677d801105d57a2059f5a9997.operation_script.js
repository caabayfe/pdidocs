(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var imageSrc = new MyCompany().getBannerSrc();
	var src = imageSrc.toString();
	if (src == "1d9db08653522300dda1ddeeff7b1215.iix") // old servicenow logo src
		src = null;
	
	result = {"imgSrc": src};
	response.setBody(result);

})(request, response);
