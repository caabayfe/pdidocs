var topicRowCSSClassName = "topic-table-row";
var selectedTopicRowCSSClassName = "highlighted-topic-table-row";
var hiddenSpaceDivider0 = $('hiddenSpaceDivider0');
var listTopicsButton = $('listTopicsButton');
var topicLoadingIcon = $('topicLoadingIcon');
var topicSelectorTableContainer = $('topicSelectorTableContainer');
var filterCriteria = $('filterCriteria');
var partitionSelection = $('partitionSelection');
var serviceSelection = $('serviceSelection');
var datacenterSelection = $('datacenterSelection');
var inspectTopicButton = $('inspectTopicButton');
var inspectTopicButtonContainer = $('inspectTopicButtonContainer');
var dateSelectorContainer = $('dateSelectorContainer');
var topicSelectorTable = $('topicSelectorTable');
var messageTable = $('messageTable');
var messagesLoadingIcon = $('messagesLoadingIcon');
var hiddenSpaceDivider1 = $('hiddenSpaceDivider1');
var messageTableContainer = $('messageTableContainer');
var nearLocationLabel = $('nearLocationLabel');
var farLocationLabel = $('farLocationLabel');
var numTopicsLabel = $('numTopicsLabel');
var NA = getMessage("N/A");
var PARTITION_DATA_ATTR = "partitionData";
var PARTITION_BTN_TRIGGERED_ATTR = "partitionButtonTriggered";
var INTERNAL = false;
var MAX_PLAIN_TEXT_PAYLOAD_VIEWING_SIZE = 20;
var MAX_PAYLOAD_VIEWING_SIZE = 10000;
var gwt = new GwtMessage();
var helperClass = new HermesTopicInspectorUIScript(); // initalize sys_ui_script
var valueOrNA = helperClass.valueOrNA;
var offsetValueOrNA = helperClass.offsetValueOrNA;
var getResponseElements = helperClass.getResponseElements;
var invalidServerResponsePopUp = helperClass.invalidServerResponsePopUp;
var groupAndSortPartitions = helperClass.groupAndSortPartitions;

function getServicesList() {
    ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getHermesAppServices");
    ajax.getXML(_processGetServicesResponse);

    function _processGetServicesResponse(response) {
        var serviceElements = getResponseElements(response, "services");
        serviceSelection.innerHTML = "";
        for (i = 0; i < serviceElements.length; i++) {
            var serviceName = serviceElements[i].getAttribute("name");
            var newOption = document.createElement("option");
            newOption.text = serviceName;
            newOption.value = serviceName;
            serviceSelection.add(newOption);
        }
    }
}

function listTopics(service) {
    if (g_user.hasRoleExactly('maint'))
        INTERNAL = $('internalRadio').checked;
    else
        INTERNAL = false;

    toggleElementDisplayOnLoadTopics();
    ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getTopicInfo");
    ajax.addParam("namespace", INTERNAL ? "sni" : "snc");
    ajax.addParam("service", service);
    listTopicsButton.disabled = true; // This is re-enabled once the AJAX call completes
    ajax.getXML(_processListTopicsResponse);

    function _processListTopicsResponse(response) {
        try {
            _handleTopicLocation(response);
            topicLoadingIcon.style.display = "none";
            var topicElements = getResponseElements(response, "topics");
            if (invalidTopicElements(topicElements))
                return;

            numTopicsLabel.innerHTML = "<strong>" + topicElements.length + "</strong>";
            toggleElementDisplayOnTopicList();
            clearElementsOnTopicList();
            clearPartition();
            var tableBody = topicSelectorTable.querySelector("tbody");
            for (var rowIndex = 0; rowIndex < topicElements.length; rowIndex++) {
                var row = tableBody.insertRow(rowIndex);
                row.classList.add(topicRowCSSClassName);
                initTableCells(topicElements[rowIndex], row, tableBody);
                row.onclick = function() {
                    var selectedRow = topicSelectorTable.querySelector("." + selectedTopicRowCSSClassName);
                    if (selectedRow) {
                        clearPartition();
                        selectedRow.classList.remove(selectedTopicRowCSSClassName);
                    }

                    this.classList.add(selectedTopicRowCSSClassName);

                };
            }
        } finally {
            listTopicsButton.disabled = false;
        }

        function _handleTopicLocation(response) {
            var locationElement = getResponseElements(response, "location");
            if (!locationElement || !locationElement.length) {
                nearLocationLabel.innerText = NA;
                farLocationLabel.innerText = NA;
                return;
            }

            locationElement = locationElement[0];
            var primary = locationElement.getAttribute("primary");

            if (primary) {
                nearLocationLabel.setAttribute("dc", primary);
                nearLocationLabel.innerHTML = "<strong>" + primary + "</strong>";
            }
            var secondary = locationElement.getAttribute("secondary");
            if (!secondary || secondary === "")
                secondary = NA;
            farLocationLabel.setAttribute("dc", secondary);
            farLocationLabel.innerHTML = "<strong>" + secondary + "</strong>";


            //update datacenter selection drop-down
            var names = primary + "," + secondary;
            var namesArray = names.split(",");
            datacenterSelection.innerHTML = "";
            var defaultOption = document.createElement("option");
            defaultOption.text = "all";
            datacenterSelection.add(defaultOption);
            for (i = 0; i < namesArray.length; i++) {
                var newOption = document.createElement("option");
                newOption.text = namesArray[i];
                datacenterSelection.add(newOption);
            }

        }

        function invalidTopicElements(topicElements) {
            if (!topicElements) {
                hiddenSpaceDivider0.style.display = "none";
                invalidServerResponsePopUp();
                return true;
            }
            if (topicElements.length == 0) {
                hiddenSpaceDivider0.style.display = "none";
                noTopicsPopUp();
                return true;
            }
            return false;
        }

        function noTopicsPopUp() {
            var gm = new GlideModal('glide_info');
            gm.setTitle(getMessage("No Topics To Display"));
            gm.render();
        }
    }

    function initTableCells(topicElement, row, tableBody, initialTopic) {
        var topic = valueOrNA(topicElement.getAttribute("topic"));
        var service = serviceSelection.value;
        var cell = "";
        cell = "<td topic =" + topic + ">" + topic + "</td>";
        cell += "<td/><td/>";
        row.innerHTML = cell;
        var loadCell = row.insertCell();
        if (g_user.hasRoleExactly("maint") || g_user.hasRoleExactly("admin"))
            //include all links
            loadCell.innerHTML = "<a>" + getMessage("Load Partition Info") + "</a>" + ", " + "<a>" + getMessage("View Consumer Info") + "</a>" + ", " + "<a>" + getMessage("Audit Info") + "</a>";
        else
            //exclude link for audit
            loadCell.innerHTML = "<a>" + getMessage("Load Partition Info") + "</a>" + ", " + "<a>" + getMessage("View Consumer Info") + "</a>";

        loadCell.children[0].onclick = function() {
            if (this.hasAttribute(PARTITION_BTN_TRIGGERED_ATTR))
                return;

            this.innerHTML = "<a>" + getMessage("Refresh Partition Info") + "</a>";
            getPartitions(topic, service, row, tableBody, this);
        };
        loadCell.children[1].onclick = function() {
            var gm = new GlideModal('hermes_consumer_viewer_modal');
            gm.setSize("modal-95"); // maximize width of modal
            gm.setPreference('topic', topic);
            gm.setPreference('internal', new Boolean(INTERNAL).toString());
            gm.setPreference('nearClusterLocation', nearLocationLabel.getAttribute('dc'));
            gm.setPreference('service', service);
            gm.setTitle(getMessage('Consumer Info For Topic ') + '"' + topic + '"');
            gm.render();
        };
        if (g_user.hasRoleExactly("maint") || g_user.hasRoleExactly("admin")) {
            loadCell.children[2].onclick = function() {
                openAuditLink(topic, service);
            };
        }

        var isInitialTopic = topic.includes(initialTopic);
        if (isInitialTopic) {
            row.classList.add(selectedTopicRowCSSClassName);
            loadCell.children[0].onclick();
        }
    }

    function toggleElementDisplayOnLoadTopics() {
        hiddenSpaceDivider0.style.display = "block";
        topicLoadingIcon.style.display = "block";
        topicSelectorTableContainer.style.display = "none";
        filterCriteria.style.display = "none";
        messagesLoadingIcon.style.display = "none";
        hiddenSpaceDivider1.style.display = "none";
        messageTableContainer.style.display = "none";
        nearLocationLabel.innerText = "";
        farLocationLabel.innerText = "";
    }

    function toggleElementDisplayOnTopicList() {
        hiddenSpaceDivider0.style.display = "block";
        topicSelectorTableContainer.style.display = "block";
        filterCriteria.style.display = "block";
    }

    function clearElementsOnTopicList() {
        var tableBody = topicSelectorTable.querySelector("tbody");
        tableBody.innerHTML = "";
        tableBody = messageTable.querySelector("tbody");
        tableBody.innerHTML = "";
    }

    function clearPartition() {
        //partition
        partitionSelection.innerHTML = "";
        var defaultOption = document.createElement("option");
        defaultOption.text = "All";
        defaultOption.value = "-1";
        partitionSelection.add(defaultOption);
    }
}

function openAuditLink(topic, service) {
    //open the audits data for the topic and sevice in new tab
    ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getSysServiceId");
    ajax.addParam("service", service);
    ajax.getXML(_process);

    function _process(response) {
        var sysServiceElement = getResponseElements(response, "sysService");
        if (!sysServiceElement || sysServiceElement.length == 0) {
            invalidServerResponsePopUp();
            return;
        }
        var serviceId = sysServiceElement[0].getAttribute("serviceId");
        if (!serviceId) {
            invalidServerResponsePopUp();
            return;
        }
        var url = new GlideURL("hermes_topic_audit_records_list.do");
        url.addParam("sysparm_query", "topic_nameLIKE" + topic + "^service_id=" + serviceId);
        top.window.open(url.getURL(), "_blank");
    }
}

function updatePartitionSelection(topic, service) {
    //update drop-down with defined partitions
    ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getPartitionCount");
    ajax.addParam("internal", INTERNAL);
    ajax.addParam("topic", topic);
    ajax.addParam("service", service);
    ajax.getXML(_process);

    function _process(response) {
        var count = response.responseXML.documentElement.getAttribute("answer");
        partitionSelection.innerHTML = "";
        var defaultOption = document.createElement("option");
        defaultOption.text = "All";
        defaultOption.value = "-1";
        partitionSelection.add(defaultOption);
        for (i = 0; i < count; i++) {
            var newOption = document.createElement("option");
            newOption.text = i;
            partitionSelection.add(newOption);
        }
    }
}

function getPartitions(topic, service, row, tableBody, selectedHrefElement) {
    var partitionsLoadingRow = tableBody.insertRow(row.rowIndex);
    var partitionsLoadingCell = partitionsLoadingRow.insertCell();
    partitionsLoadingCell.innerText = getMessage("Loading...");
    updatePartitionSelection(topic, service);
    var ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getPartitions");
    ajax.addParam("topic", topic);
    ajax.addParam("internal", INTERNAL);
    ajax.addParam("service", service);

    selectedHrefElement.setAttribute(PARTITION_BTN_TRIGGERED_ATTR, true); // This causes us to return early if multi-clicked. This is reset once the AJAX call completes
    ajax.getXML(_processPartitionsResponse);

    function _processPartitionsResponse(response) {
        try {
            tableBody.deleteRow(partitionsLoadingRow.rowIndex - 1);
            var partitionInfoList = getResponseElements(response, "partitions");
            if (!partitionInfoList || partitionInfoList.length == 0) { // Receiving 0 partitions is considered an invalid response from the server
                invalidServerResponsePopUp();
                return;
            }
            var nearDC = nearLocationLabel.getAttribute("dc");
            partitionInfoList = groupAndSortPartitions(partitionInfoList, nearDC);
            checkForUnbalancedPartitions(partitionInfoList);
            createTopicTableCells(partitionInfoList, row, tableBody);
        } finally {
            selectedHrefElement.removeAttribute(PARTITION_BTN_TRIGGERED_ATTR);
        }
    }

    function checkForUnbalancedPartitions(partitionInfoList) {
        var half = Math.ceil(partitionInfoList.length / 2);
        var firstHalf = partitionInfoList.slice(0, half);
        var secondHalf = partitionInfoList.slice(half);
        if (firstHalf.length != secondHalf.length) {
            var gm = new GlideModal('glide_alert_standard');
            gm.setTitle(getMessage("The topic partition count is unbalanced across clusters. Synchronize partition counts by navigating to the sys_kafka_table and selecting 'Synchronize Partition Count'."));
            gm.setPreference('warning', true);
            gm.render();
            return;
        }
        var numDcs = new Set(partitionInfoList.map(function(elem) {
            return elem.getAttribute("dc");
        })).size;
        if (numDcs <= 1) {
            gm = new GlideModal('glide_alert_standard');
            gm.setTitle(getMessage("The topic partition count could not be retrieved from all clusters. Some clusters may be unavailable or the partition count may be unbalanced. Navigate to the sys_kafka_table and select 'Synchronize Partition Count'."));
            gm.setPreference('warning', true);
            gm.render();
            return;
        }
    }

    function createTopicTableCells(partitionInfoList, row, tableBody) {
        prepareTable(row, tableBody);
        for (i = 0; i < partitionInfoList.length; i++) {
            var partitionInfo = partitionInfoList[i];
            if (!partitionInfo)
                continue;

            var partitionRow = tableBody.insertRow(row.rowIndex);
            partitionRow.classList.add('partition-table-row');
            partitionRow.classList.remove('hover');
            partitionRow.setAttribute(PARTITION_DATA_ATTR, true);
            partitionRow.innerHTML = createPartitionRowHTML(partitionInfo);
        }
    }

    function prepareTable(row, tableBody) {
        var index = row.rowIndex;
        var tableRow = tableBody.rows[(index)];
        //Check if theres already partition data, if so delete those rows
        while (tableRow != undefined && tableRow.hasAttribute(PARTITION_DATA_ATTR)) {
            tableBody.deleteRow(index);
            tableRow = tableBody.rows[index];
        }
    }

    function createPartitionRowHTML(partitionInfo) {
        var partitionValue = valueOrNA(partitionInfo.getAttribute("value"));
        var begOffset = offsetValueOrNA(partitionInfo.getAttribute("beginningOffset"));
        var endOffset = offsetValueOrNA(partitionInfo.getAttribute("endOffset"));
        var dc = valueOrNA(partitionInfo.getAttribute("dc"));
        var rowData = "<td>" + "Partition-" + partitionValue + "-" + dc + "</td>";
        rowData += "<td>" + begOffset + "</td>";
        rowData += "<td>" + endOffset + "</td>";
        return rowData;
    }
}

function inspectTopic(dateChoice, endDateChoice, partitionId, location, service, type) {
    var msgFilter = $('messageBodyFilter').value;
    if (msgFilter != "") {
        try {
            var regex = new RegExp(msgFilter);
        } catch (e) {
            invalidRegex();
            return;
        }
    }

    //reset values for new searches
    //values are retain when using pagination link
    if (type == 'button') {
        $('groupId').value = "";
    }
    var topicRow = $('topicSelectorTable').querySelector("." + selectedTopicRowCSSClassName);
    if (!topicRow) {
        selectATopicPopUp();
        return;
    }
    if (!dateChoice || !endDateChoice || (dateChoice == endDateChoice)) {
        selectDatePopUp();
        return;
    }
    var selectedTopic = topicRow.cells[0].getAttribute("topic");
    toggleElementDisplayOnLoadMessages();
    var ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getMessages");
    ajax.addParam("topic", selectedTopic);
    ajax.addParam("dateChoice", dateChoice);
    ajax.addParam("endDateChoice", endDateChoice);
    ajax.addParam("groupId", $('groupId').value);
    ajax.addParam("messageBodyFilter", msgFilter);
    ajax.addParam("partitionId", partitionId);
    ajax.addParam("location", location);
    ajax.addParam("internal", INTERNAL);
    ajax.addParam("service", service);
    inspectTopicButton.disabled = true; // This is re-enabled once the AJAX call completes
    ajax.getXML(_processInspectTopicResponse);

    function _processInspectTopicResponse(response) {
        try {
            messagesLoadingIcon.style.display = "none";
            var messageElements = getResponseElements(response, "hermesMessages");
            var unreadableMsgElements = getResponseElements(response, "hasUnreadableMsgs");

            var groupid = getResponseElements(response, "hermesFullGroupId");
            if (!groupid) {
                hiddenSpaceDivider1.style.display = "none";
                invalidServerResponsePopUp();
                return;
            }
            $('groupId').value = groupid[0].getAttribute("data");

            if (invalidMessageElements(messageElements, unreadableMsgElements))
                return;

            toggleElementDisplayOnListMessages();
            $('messageTableCaption').innerHTML = '<b>' + getMessage('Messages For Topic ') + '"' + selectedTopic + '"</b>';

            var tableBody = $('messageTable').querySelector("tbody");
            tableBody.innerHTML = "";
            //STRY57507231
            //Adding to HTML table in reverse order to display messages in ascending order
            for (var rowIndex = (messageElements.length - 1); rowIndex >= 0; rowIndex--) {
                var row = tableBody.insertRow(0);
                setTableCells(messageElements[rowIndex], row);
            }
        } finally {
            inspectTopicButton.disabled = false;
        }
    }

    function invalidMessageElements(messageElements, unreadableMsgElements) {
        if (unreadableMsgElements && unreadableMsgElements.length > 0) {
            var hasUnreadableMsgs = unreadableMsgElements[0].getAttribute("data");
            if (hasUnreadableMsgs === "true") {
                hiddenSpaceDivider1.style.display = "none";
                unreadableMsgPopUp();
                return true;
            }
        }

        if (!messageElements) {
            hiddenSpaceDivider1.style.display = "none";
            invalidServerResponsePopUp();
            return true;
        }
        if (messageElements.length == 0) {
            hiddenSpaceDivider1.style.display = "none";
            noMessagesPopUp();
            return true;
        }
        return false;
    }

    function setTableCells(messageElement, row) {
        var dc = messageElement.getAttribute("dc");
        var offset = offsetValueOrNA(messageElement.getAttribute("offset"));
        var displayTime = valueOrNA(messageElement.getAttribute("displayTime")); // e.g. 2023-01-08 12:48:36
        var numericTime = valueOrNA(messageElement.getAttribute("numericTime")); // e.g. 1673461122875
        var partition = valueOrNA(messageElement.getAttribute("partition"));
        var cell = "<td>" + dc + " - " + offset + "</td>";
        cell += "<td>" + partition + "</td>";
        cell += "<td>" + displayTime + " (" + numericTime + ")</td>";
        row.innerHTML = cell;
        var downloadFileNameBase = dc + '-' + offset + '-' + partition + '-' + numericTime;
        var headersCell = row.insertCell();
        var headers = valueOrNA(messageElement.getAttribute("headers"));
        var headersModalTitle = getMessage("Headers Data");
        var headersDownloadFileName = getMessage("headers");
        populateCell(headersCell, headers, false, headersModalTitle, headersDownloadFileName + "-" + downloadFileNameBase);
        var keyCell = row.insertCell();
        var key = valueOrNA(messageElement.getAttribute("key"));
        var keyModalTitle = getMessage("Key Data");
        var keyDownloadFileName = getMessage("key");
        var isKeyError = messageElement.getAttribute("isKeyError");
        populateCell(keyCell, key, isKeyError, keyModalTitle, keyDownloadFileName + "-" + downloadFileNameBase);
        var payloadCell = row.insertCell();
        var payload = valueOrNA(messageElement.getAttribute("payload"));
        var payloadModalTitle = getMessage("Payload Data");
        var payloadDownloadFileName = getMessage("payload");
        var isPayloadError = messageElement.getAttribute("isPayloadError");
        populateCell(payloadCell, payload, isPayloadError, payloadModalTitle, payloadDownloadFileName + "-" + downloadFileNameBase);
    }

    function populateCell(cell, messageData, isError, modalTitle, downloadFileName) {
        // DO NOT use "cell.innerHTML" here as there could be html tags in 'messageData'
        if (messageData != NA && isError == "true")
            cell.innerText = gwt.getMessage("Error: {0}", messageData);
        else if (messageData.length < MAX_PLAIN_TEXT_PAYLOAD_VIEWING_SIZE)
            cell.innerText = messageData;
        else
            populateLargeMessageCell(cell, messageData, modalTitle, downloadFileName);

    }

    function populateLargeMessageCell(cell, messageData, modalTitle, downloadFileName) {
        var viewHTML = getViewButtonHTML(messageData);
        var downloadHTML = "<div style='float:right;'><a title='" + getMessage("Download") + "'><i class='icon-download'></i></a></div>";
        cell.innerHTML = viewHTML + downloadHTML;
        if (messageData.length < MAX_PAYLOAD_VIEWING_SIZE)
            cell.children[0].getElementsByTagName('a')[0].onclick = messageViewerModalSupplier(modalTitle, messageData);

        var blob = new Blob([messageData], {
            type: 'text/plain'
        });
        cell.children[1].getElementsByTagName('a')[0].onclick = function() {
            download(blob, downloadFileName);
        };
    }

    function messageViewerModalSupplier(title, text) {
        return function() {
            var gm = new GlideModal('hermes_message_viewer_modal');
            gm.setTitle(title);
            gm.setPreference('text', text);
            gm.render();
        };
    }

    function getViewButtonHTML(messageData) {
        var blob = new Blob([messageData], {
            type: "text/plain"
        });
        var messageSizeText = "(" + blob.size + " bytes)";
        var div = "<div style='float:left;'>";
        if (messageData.length < MAX_PAYLOAD_VIEWING_SIZE)
            return div + "<a>" + getMessage("View") + "</a> " + messageSizeText + "</div>";
        else
            return div + getMessage("Too large to view in browser, please download ") + messageSizeText + "</div>";
    }

    function noMessagesPopUp() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("No Messages To Display"));
        gm.render();
    }

    function unreadableMsgPopUp() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Unable to display messages"));
        gm.setPreference('title', getMessage("This may be because there are no messages in the time range selected or an unsupported compression format is used. Check the Hermes documentation for supported compression configurations."));
        gm.render();
    }

    function selectATopicPopUp() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Please Select a Topic"));
        gm.render();
    }

    function selectDatePopUp() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Please Select a Start and End Date; Start and End Date should not be the same"));
        gm.render();
    }

    function invalidRegex() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Please provide valid Regular Expression for Message Body Filter"));
        gm.render();
    }

    function toggleElementDisplayOnLoadMessages() {
        messageTableContainer.style.display = "none";
        hiddenSpaceDivider1.style.display = "block";
        messagesLoadingIcon.style.display = "block";
    }

    function toggleElementDisplayOnListMessages() {
        hiddenSpaceDivider1.style.display = "block";
        messageTableContainer.style.display = "block";
    }

    function download(blob, filename) {
        var a = document.createElement('a');
        var url = URL.createObjectURL(blob);
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        a.click();
    }
}
