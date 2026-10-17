function parseStats() {
    var XMLUtil = GlideXMLUtil;
    var midName = String(current.source).split(":")[1];
    var midSysId;
    var threads = {};
	var payload = current.payload;

	var gr = new GlideRecord('ecc_agent');
    gr.addQuery('name', midName);
    gr.setLimit(1);
    gr.query();

	if (!gr.next()) { // mid is uninitialized, log and bail
        gs.warn("Unable to find MID Server named " + midName + " but received a stats ecc_queue record for it (" + current.sys_id + ")");
        return;
    }

	if (payload == '<see_attachment/>') {
		var sa = new GlideSysAttachment();
		payload = sa.get(current, 'payload');
	}

	var statsDocument = XMLUtil.parse(payload);
    if (statsDocument) {
        var root = statsDocument.getDocumentElement();
        var version = XMLUtil.getElementValueByTagName(statsDocument, "MIDServerBuildVersion");
        var jvmVersion = XMLUtil.getElementValueByTagName(statsDocument, "MIDServerJavaVersion");
        var midXmlId = XMLUtil.getElementValueByTagName(statsDocument, "MIDServerSysId");
        var newTimeStamp = XMLUtil.getElementValueByTagName(statsDocument, "MIDServerTimeStamp");
        var hostname = XMLUtil.getElementValueByTagName(statsDocument, "MIDServerHostName");

        var threadsNode = XMLUtil.selectSingleNode(root, "//threads");
        var threadsList = XMLUtil.selectNodes(threadsNode, "//thread");
        for (var i = 0; i < threadsList.getLength(); i++) {
            var thread = threadsList.item(i);
            var tName = XMLUtil.getAllText(thread);
            var tDaemon = thread.getAttribute("daemon");
            var tPriority = thread.getAttribute("priority");
            var tGroup = thread.getAttribute("threadGroup");
            var tId = thread.getAttribute("threadId");

            if (tGroup == "system")
                continue;

            threads[tId] = {};
            threads[tId].daemon = tDaemon;
            threads[tId].priority = tPriority;
            threads[tId].name = tName;
        }

        midSysId = gr.sys_id;
        if (jvmVersion && gr.isValidField("jvm_version"))
            gr.jvm_version = jvmVersion;

        if (newTimeStamp && gr.isValidField("started")) {
            var startedTime = (new GlideDateTime(gr.started)).getNumericValue();
            if (newTimeStamp > startedTime) {
                gr.version = version;
                if (hostname)
                    gr.host_name = hostname;
            }
        }

        gr.update();

        var am = new AgentMetrics();
        am.process(midSysId, statsDocument);
    }

    if (midSysId) {
        var gr = new GlideRecord('ecc_agent_thread');
        gr.addQuery('ecc_agent', midSysId);
        gr.query();
        while (gr.next()) {
            var id = gr.id;
            if (!threads[id]) {
                delete threads[id];
                gr.deleteRecord();
            } else {
                gr.name = threads[id].name;
                gr.priority = threads[id].priority;
                gr.update();
                delete threads[id];
            }
        }

        for (var id in threads) {
            gr.initialize();
            gr.id = id;
            gr.ecc_agent = midSysId;
            gr.priority = threads[id].priority;
            gr.daemon = threads[id].daemon;
            gr.name = threads[id].name;
            gr.insert();
        }
    }
}

parseStats();
current.state = 'processed';
current.processed = gs.nowDateTime();
current.update();
