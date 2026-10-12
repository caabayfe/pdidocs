(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function createWorker(gr) {
		var type = gr.getValue("type");
		var progressName = "";
		var scriptName = "";

		switch (type) {
			case "smtp":
				progressName = "Testing SMTP Connection";
				scriptName = "TestSMTPConnectionWorker"; 
				break;
			case "pop3":
				progressName = "Testing POP3 connection";
				scriptName = "TestPOP3ConnectionWorker"; 
				break;
			case "imap":
				progressName = "Testing IMAP connection";
				scriptName = "TestIMAPConnectionWorker"; 			
				break;
			case "graph-receive":
				progressName = "Testing GraphReceive connection";
				scriptName = "TestGraphReceiveConnectionWorker"; 
				break;
			case "graph-send":
				progressName = "Testing GraphSend connection";
				scriptName = "TestGraphSendConnectionWorker"; 

		}
		progressName = "Email Diagnostics: " + progressName;

        var worker = new GlideScriptedProgressWorker();
        worker.setProgressName(progressName);
        worker.setName(scriptName);
        worker.addParameter(gr.getUniqueValue());
        worker.setBackground(true);
        worker.start();

        return response.setBody({
			accountId: accountId,
			progressID: worker.progressID 
		});
    }
    var accountId = request.body.data.accountId;
    var gr = new GlideRecord("sys_email_account");

	//ALso check security
    if (gr.get(accountId)) {
		createWorker(gr);
    } else {
		response.setBody({
			accountId: accountId,
			status: "Account not found"
		});
	}

})(request, response);
