(function executeRule(current, previous /*null when async*/ ) {

    var xmlPayload = GlideXMLUtil.parse(current.payload);
    var error = xmlPayload.getDocumentElement().getAttribute('error');
    if (JSUtil.notNil(error))
        current.state = "error";
    else
        current.state = "processed";

    current.processed = new GlideDateTime();
    current.update();

    // update the deployment request record
    var deployRequestParam = GlideXMLUtil.selectSingleNode(xmlPayload.getDocumentElement(), "//parameter[@name='deployment_request_id']");
    var deploymentRequestId;
    if (JSUtil.notNil(deployRequestParam))
        deploymentRequestId = deployRequestParam.getAttribute('value');

    var gr = new GlideRecord('mid_server_deployment');
    if (gr.get(deploymentRequestId)) {
        var outputNode = GlideXMLUtil.selectSingleNode(xmlPayload.getDocumentElement(), "/results/result/output");
        var output = '';
        if (outputNode)
            output = outputNode.getTextContent();
        gr.setValue('results', output);

        var resultCode = '' + xmlPayload.getDocumentElement().getAttribute('result_code');
        switch (resultCode) {
            case "0":
                gr.setValue('state', 'complete');
                break;
            case "900":
                gr.setValue('state', 'partial_success');
                break;
            default:
                gr.setValue('state', 'failed');
                break;
        }
        gr.setValue('processed_at', current.processed);
        gr.update();
    }
})(current, previous);
