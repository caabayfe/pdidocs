(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var sysId = request.pathParams.sys_id;
    // Check if sysId is sent
    if (!sysId) {
        response.setStatus(400);
        response.setContentType('application/json');
        response.getStreamWriter().writeString('{"error":"Missing sys_id"}');
        return;
    }

	var requestBody = request.body || null;
	var requestBodyData = (requestBody && requestBody.dataString) || "";
	var glideJWT = null;
	if (!requestBody || !requestBodyData) {
		response.setStatus(400);
		response.setContentType('application/json');
		response.getStreamWriter().writeString('{"error":"Missing request body"}');
		return;
	}
	var requestPayload = JSON.parse(requestBodyData);
	glideJWT = requestPayload["Glide-JWT"];
    // Check if JWT is sent
    if (!glideJWT) {
        response.setStatus(400);
        response.setContentType('application/json');
        response.getStreamWriter().writeString('{"error":"Missing JWT"}');
        return;
    }

    // Validate JWT
    var validationResponse = sn_one_extend.GenerativeAIUtility.validateJWT(glideJWT);
    
    // Validate attachment access using scriptable API
    var validationResult = sn_cs_offglide.OffGlideScriptObject.validateAttachmentAccess(validationResponse, sysId);
    
    if (!validationResult.success) {
        response.setStatus(validationResult.statusCode);
        response.setContentType('application/json');
        response.getStreamWriter().writeString('{"error":"' + validationResult.errorMessage + '"}');
        return;
    }

    // Get attachment record (already validated by Java service)
    var gr = new GlideRecord('sys_attachment');
    gr.addQuery('sys_id', sysId);
    gr.setLimit(1);
    gr.query();
    if (!gr.next()) {
        response.setStatus(404);
        response.setContentType('application/json');
        response.getStreamWriter().writeString('{"error":"Attachment not found"}');
        return;
    }

    // Generate Filename
    var rawFilename = gr.getValue('file_name') || 'attachment';
    var safeFilename = rawFilename.replace(/["\\\r\n]/g, '_');

    // Set Response Headers
    response.setStatus(200);
    response.setContentType(gr.getValue('content_type'));
    response.setHeader(
        'Content-Disposition',
        'attachment; filename="' + safeFilename + '"'
    );

    // Stream the attachment
    var writer = response.getStreamWriter();
    var stream = new GlideSysAttachmentInputStream(sysId);
    writer.writeStream(stream);

})(request, response);
