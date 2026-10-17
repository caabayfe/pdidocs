var loadingIcon = $('loadingIcon');
var consumerInfoTable = $('consumerInfoTable');
var helperClass = new HermesTopicInspectorUIScript(); // initalize sys_ui_script
var valueOrNA = helperClass.valueOrNA;
var offsetValueOrNA = helperClass.offsetValueOrNA;
var getResponseElements = helperClass.getResponseElements;
var invalidServerResponsePopUp = helperClass.invalidServerResponsePopUp;
var groupAndSortPartitions = helperClass.groupAndSortPartitions;

function loadConsumerData() {
    var modalObj = GlideModal.prototype.get('hermes_consumer_viewer_modal');
    var ajax = new GlideAjax("AJAXHermesTopicInspector");
    ajax.addParam("sysparm_name", "getConsumerInfoForTopic");
    ajax.addParam("topic", modalObj.getPreference('topic'));
    ajax.addParam("owner", modalObj.getPreference('owner'));
    ajax.addParam("service", modalObj.getPreference('service'));
    ajax.addParam("internal", modalObj.getPreference('internal') == "true");
    ajax.getXML(_processGetConsumerInfoResponse);

    function _processGetConsumerInfoResponse(response) {
        var partitions = getResponseElements(response, "partitions");
        if (!partitions || partitions.length == 0) { // Receiving 0 partitions is considered an invalid response from the server
            invalidServerResponsePopUp();
            return;
        }
        toggleDisplayOnLoad();
        partitions = groupAndSortPartitions(partitions, modalObj.getPreference('nearClusterLocation'));
        consumerInfoTable.style.width = window.innerWidth;
        var tableBody = consumerInfoTable.querySelector("tbody");
        for (var i = 0; i < partitions.length; i++) {
            var partitionRow = tableBody.insertRow(0);
            partitionRow.setAttribute("partitiondata", true);
            var partitionInfo = partitions[i];
            partitionRow.innerHTML = createPartitionRowHTML(partitionInfo);
            var consumers = partitions[i].getElementsByTagName('consumers');
            for (var j = 0; j < consumers.length; j++) {
                var consumerRow = tableBody.insertRow(partitionRow.rowIndex);
                consumerRow.classList.add('consumer-table-row');
                var consumerInfo = consumers[j];
                consumerRow.innerHTML = createConsumerRowHTML(consumerInfo, partitionInfo.getAttribute("endOffset"));
            }
        }
    }

    function toggleDisplayOnLoad() {
        loadingIcon.style.display = "none";
        consumerInfoTable.style.display = "table";
    }

    function createPartitionRowHTML(partitionInfo) {
        var partitionValue = valueOrNA(partitionInfo.getAttribute("value"));
        var begOffset = offsetValueOrNA(partitionInfo.getAttribute("beginningOffset"));
        var endOffset = offsetValueOrNA(partitionInfo.getAttribute("endOffset"));
        var dc = valueOrNA(partitionInfo.getAttribute("dc"));
        var rowData = "<td>" + "Partition-" + partitionValue + "-" + dc + "</td>";
        rowData += "<td>" + begOffset + "</td>";
        rowData += "<td>" + endOffset + "</td>";
        rowData += "<td /><td /><td /><td />"; // see if cleaner way to do this
        return rowData;
    }

    function createConsumerRowHTML(consumerInfo, endOffset) {
        var consumerId = valueOrNA(consumerInfo.getAttribute('consumerId'));
        var groupId = valueOrNA(consumerInfo.getAttribute('groupId'));
        var currentOffset = valueOrNA(consumerInfo.getAttribute('currentOffset'));
        var consumerData = "<td /><td /><td />";
        consumerData += "<td>" + valueOrNA(groupId) + "</td>";
        consumerData += "<td>" + valueOrNA(consumerId) + "</td>";
        consumerData += "<td>" + offsetValueOrNA(currentOffset) + "</td>";
        var lag = offsetValueOrNA(endOffset - currentOffset);
        var backgroundColor;
        if (lag == 0)
            backgroundColor = "rgba(102, 255, 51, 0.5)";
        else if (lag > 0)
            backgroundColor = "rgba(255, 255, 102, 0.5)";
        else
            backgroundColor = "rgba(255, 0, 0, 0.5)";

        consumerData += "<td style='background-color:" + backgroundColor + "'>" + lag + "</td>";
        return consumerData;
    }

}
