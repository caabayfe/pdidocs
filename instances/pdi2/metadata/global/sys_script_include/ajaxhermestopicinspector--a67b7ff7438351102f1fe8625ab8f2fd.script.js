var AJAXHermesTopicInspector = Class.create();
AJAXHermesTopicInspector.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getTopicInfo: function() {
        var namespace = this.getParameter("namespace");
        var service = this.getParameter("service");
        var topicInspector = new sn_hermes.HermesTopicInspector();
        var topicInfo = topicInspector.getAllTopicsForService(service, namespace);
        var location = this.newItem("location");
        location.setAttribute("primary", topicInfo.getNear());
        location.setAttribute("secondary", topicInfo.getFar());
        var topics = topicInfo.getTopics();

        for (i = 0; i < topics.length; i++) {
            var ti = topics[i];
            var topic = this.newItem("topics");
            topic.setAttribute("topic", ti.getName());
        }
    },
    getPartitions: function() {
        var topic = this.getParameter("topic");
        var internal = this.getParameter("internal");
        var service = this.getParameter("service");
        var partitionInspector = new sn_hermes.HermesPartitionInspector();
        var partitionInfos = partitionInspector.getPartitionInfoForTopicForService(topic, internal, service);
        for (i = 0; i < partitionInfos.length; i++) {
            var partitionInfo = partitionInfos[i];
            var partition = this.newItem('partitions');
            partition.setAttribute('value', partitionInfo.getValue());
            partition.setAttribute('beginningOffset', partitionInfo.getBeginningOffset());
            partition.setAttribute('endOffset', partitionInfo.getEndOffset());
            partition.setAttribute('dc', partitionInfo.getDatacenter());
        }
    },
    getPartitionCount: function() {
        var topic = this.getParameter("topic");
        var internal = this.getParameter("internal");
        var service = this.getParameter("service");
        var partitionInspector = new sn_hermes.HermesPartitionInspector();
        return partitionInspector.getPartitionCountForService(topic, internal, service);
    },
    getMessages: function() {
        var topic = this.getParameter("topic");
        var dateChoice = this.getParameter("dateChoice");
        var endDateChoice = this.getParameter("endDateChoice");
        var internal = this.getParameter("internal");
        var partitionId = this.getParameter("partitionId");
        var location = this.getParameter("location");
        var service = this.getParameter("service");
        var messageFilter = this.getParameter("messageBodyFilter");
        var id = this.getParameter("groupId");
        var fullGroupId = (id == null) ? "" : id;
        var topicInspector = new sn_hermes.HermesTopicInspector();

        var response = topicInspector.getMessagesFromTimePage(topic, internal, dateChoice, endDateChoice,
            partitionId, location, service, messageFilter, fullGroupId);
        var hermesMessages = response.getMessagesInfo();
        if (hermesMessages == null)
            return;

        var hermesFullGroupID = this.newItem("hermesFullGroupId");
        hermesFullGroupID.setAttribute("data", response.getGroupId());

		var hasUnreadableMsgError = response.getUnreadableMsgError();
		var hasUnreadableMsgs = this.newItem("hasUnreadableMsgs");
		hasUnreadableMsgs.setAttribute("data", hasUnreadableMsgError.toString());

        //generates info message for errors when requesting configured page
        var errMsg = response.errorMessage();

        for (i = 0; i < hermesMessages.length; i++) {
            var hermesMessageInfo = hermesMessages[i];
            var hermesMessage = this.newItem("hermesMessages");
            hermesMessage.setAttribute("headers", hermesMessageInfo.getHeaders());
            hermesMessage.setAttribute("partition", hermesMessageInfo.getPartition());
            hermesMessage.setAttribute("key", hermesMessageInfo.getKey());
            hermesMessage.setAttribute("isKeyError", hermesMessageInfo.isKeyError());
            hermesMessage.setAttribute("payload", hermesMessageInfo.getPayload());
            hermesMessage.setAttribute("isPayloadError", hermesMessageInfo.isPayloadError());
            var timestamp = hermesMessageInfo.getTimestamp();
            var displayTime = null;
            var numericTime = null;
            if (timestamp) {
                displayTime = timestamp.getDisplayValue();
                numericTime = timestamp.getNumericValue();
            }
            hermesMessage.setAttribute("displayTime", displayTime);
            hermesMessage.setAttribute("numericTime", numericTime);
            var offset = hermesMessageInfo.getOffset();
            var keys = Object.keys(offset);
            if (!keys || !keys.length)
                continue;

            hermesMessage.setAttribute("offset", offset[keys[0]] == null ? -1 : offset[keys[0]]);
            hermesMessage.setAttribute("dc", keys[0]);
        }
    },
    getConsumerInfoForTopic: function() {
        var topic = this.getParameter("topic");
        var internal = this.getParameter("internal") == "true";
        var service = this.getParameter("service");
        var topicInspector = new sn_hermes.HermesTopicInspector();
        var partitionConsumerEntries = topicInspector.getConsumerInfoForTopicForService(topic, internal, service);
        for (var i = 0; i < partitionConsumerEntries.length; i++) {
            var partitionConsumerEntry = partitionConsumerEntries[i];
            var partitionInfo = partitionConsumerEntry.getPartitionInfo();
            var partitionElement = this.newItem("partitions");
            partitionElement.setAttribute('value', partitionInfo.getValue());
            partitionElement.setAttribute('beginningOffset', partitionInfo.getBeginningOffset());
            partitionElement.setAttribute('endOffset', partitionInfo.getEndOffset());
            partitionElement.setAttribute('dc', partitionInfo.getDatacenter());
            var consumerInfos = partitionConsumerEntry.getConsumerInfos();
            for (var j = 0; j < consumerInfos.length; j++) {
                var consumerInfo = consumerInfos[j];
                var consumerElement = this.getDocument().createElement('consumers');
                partitionElement.appendChild(consumerElement);
                consumerElement.setAttribute('consumerId', consumerInfo.getConsumerId());
                consumerElement.setAttribute('groupId', consumerInfo.getGroupId());
                consumerElement.setAttribute('currentOffset', consumerInfo.getCurrentOffset());
            }
        }
    },
    getHermesAppServices: function() {
        var gr = new GlideRecord("hermes_app_services");
        gr.query();

        var servicesList = [];
        while (gr.next())
            servicesList.push(gr.getDisplayValue('service_id'));
        var arrayUtil = new ArrayUtil();
        servicesList = arrayUtil.unique(servicesList);

        for (var i = 0; i < servicesList.length; i++) {
            var service = this.newItem("services");
            service.setAttribute("name", servicesList[i]);
        }
    },
    getSysServiceId: function() {
        var service = this.getParameter("service");
        var gr = new GlideRecord("sys_service");
        gr.addQuery("name", service);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var sysService = this.newItem("sysService");
            sysService.setAttribute("serviceId", gr.getUniqueValue());
        }
    },
    type: 'AJAXHermesTopicInspector'
});
