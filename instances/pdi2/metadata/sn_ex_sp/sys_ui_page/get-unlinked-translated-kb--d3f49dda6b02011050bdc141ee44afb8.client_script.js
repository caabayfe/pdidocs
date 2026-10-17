var topicKBMap = [];
	var pageHeadingMsg = getMessage("Unlinked translated knowledge articles");
	var topicsCountMsg = getMessage("Topics with unlinked knowledge articles count");
	var kbsCountMsg = getMessage("Unlinked translated knowledge articles count");
	var noneKBsMsg = getMessage("No unlinked knowledge articles exist");
	var refreshButtonText = getMessage("Refresh list");
	var linkAllButtonText = getMessage("Link all translated knowledge articles");
	var noPluginMsg = getMessage("Translation plugin is not installed, please install and try again after sometime");

	var thKnowledgeArticles = getMessage("Knowledge articles");
	var thTopicName = getMessage("Topic name");
	var thTopicSysId = getMessage("Topic sysId");

    window.onload = function () {
		document.getElementById("pageheading").innerHTML = pageHeadingMsg;
		document.getElementById("topics-count").innerHTML = topicsCountMsg;
		document.getElementById("kbs-count").innerHTML = kbsCountMsg;
		document.getElementById("linkKBsButton").innerHTML = linkAllButtonText;
		getTranslatedVersionsWithoutTopic();
    };
    function getTranslatedVersionsWithoutTopic() {
    document.getElementById("kb-count").innerHTML =
        '<svg class="now-icon -spin -lg spin-loader" aria-hidden="true" viewBox="0 0 24 24"><path d="M18.533 3.846a.481.481 0 0 0-.047-.731A10.95 10.95 0 0 0 12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11c0-2.156-.62-4.167-1.692-5.865a.48.48 0 0 0-.748-.073l-1.466 1.465a.522.522 0 0 0-.08.621 8 8 0 1 1-2.579-2.808c.206.139.484.12.66-.056l1.438-1.438z"></path></svg>';
    document.getElementById("topic-count").innerHTML =
        '<svg class="now-icon -spin -lg spin-loader" aria-hidden="true" viewBox="0 0 24 24"><path d="M18.533 3.846a.481.481 0 0 0-.047-.731A10.95 10.95 0 0 0 12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11c0-2.156-.62-4.167-1.692-5.865a.48.48 0 0 0-.748-.073l-1.466 1.465a.522.522 0 0 0-.08.621 8 8 0 1 1-2.579-2.808c.206.139.484.12.66-.056l1.438-1.438z"></path></svg>';
    document.getElementById("refreshButton").innerHTML =
        '&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;<svg class="now-icon -spin -lg spin-loader" aria-hidden="true" viewBox="0 0 24 24"><path d="M18.533 3.846a.481.481 0 0 0-.047-.731A10.95 10.95 0 0 0 12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11c0-2.156-.62-4.167-1.692-5.865a.48.48 0 0 0-.748-.073l-1.466 1.465a.522.522 0 0 0-.08.621 8 8 0 1 1-2.579-2.808c.206.139.484.12.66-.056l1.438-1.438z"></path></svg>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;';
    document.getElementById("none-message").style.display = "block";
    document.getElementById("none-message").innerHTML =
        '<svg class="now-icon -spin -lg spin-loader" aria-hidden="true" viewBox="0 0 24 24"><path d="M18.533 3.846a.481.481 0 0 0-.047-.731A10.95 10.95 0 0 0 12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11c0-2.156-.62-4.167-1.692-5.865a.48.48 0 0 0-.748-.073l-1.466 1.465a.522.522 0 0 0-.08.621 8 8 0 1 1-2.579-2.808c.206.139.484.12.66-.056l1.438-1.438z"></path></svg>';
    var thead = document
        .getElementById("un-kb-table")
        .getElementsByTagName("thead")[0];
    thead.innerHTML = "";
    var tbody = document
        .getElementById("un-kb-table")
        .getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    var ga = new GlideAjax("KBTranslationInternalUtilSNC");
    ga.addParam("sysparm_name", "getTranslatedKbsNotLinkedToTopic");
    ga.getXML(getResponse);
    }
    function linkTranslatedVersionsWithoutTopic() {
    var ga = new GlideAjax("KBTranslationInternalUtilSNC");
    ga.addParam("sysparm_name", "linkAllTranslatedVersionsToTopic");
    ga.getXML(getResponseAddTopic);
    }
    function getResponseAddTopic(serverResponse) {
    clearScreen();
    var result =
        serverResponse.responseXML.documentElement.getAttribute("answer");
    if (null != result && result > 0) {
        topicKBMap = [];
        renderTopicKBListonScreen();
    }
    }
    function getResponse(serverResponse) {
    clearScreen();
    var result =
        serverResponse.responseXML.documentElement.getAttribute("answer");
    var responseObj = JSON.parse(result);
    if (!responseObj.isTranslationPluginInstalled) {
        document.getElementById("none-message").style.display = "block";
        document.getElementById("none-message").innerHTML = noPluginMsg;
        document.getElementById("un-kb-table").style.display = "none";
        document.getElementById("linkKBsButton").disabled = true;
        document.getElementById("kb-count").innerHTML = "-";
        document.getElementById("topic-count").innerHTML = "-";
        document.getElementById("refreshButton").innerHTML = refreshButtonText;
        return;
    }
    topicKBMap = responseObj.topicContentMapArr;
    renderTopicKBListonScreen();
    }

    function renderTopicKBListonScreen() {
    var kbCount = 0;
    if (topicKBMap.length > 0) {
        document.getElementById("un-kb-table").style.display = "inline-block";
        var thead = document
        .getElementById("un-kb-table")
        .getElementsByTagName("thead")[0];
        thead.innerHTML =
        "<tr><th>"+thTopicName+"</th><th>"+thTopicSysId+"</th><th>"+thKnowledgeArticles+"</th></tr>";
        document.getElementById("topic-count").innerHTML = "" + topicKBMap.length;
        var table = document
        .getElementById("un-kb-table")
        .getElementsByTagName("tbody")[0];
        table.innerHTML = "";
        topicKBMap.forEach(function (topic) {
        var row = table.insertRow(-1);
        var topicname = row.insertCell(0);
        var topicSysId = row.insertCell(1);
        var kbId = row.insertCell(2);
        topicname.innerHTML = "<td>" + topic["topic"] + "</td>";
        topicSysId.innerHTML = "<td>" + topic["sys_id"] + "</td>";
        var kbString = topic["unlinkedContent"].join();
        var displayKbString="";
        if (kbString.length > 49) {
            displayKbString = kbString;
            kbString = kbString.substring(0, 48) + "...";
        }
        kbId.innerHTML = '<td><div data-toggle="tooltip" title="'+displayKbString+'">'+kbString+'</td>';
        kbCount += topic["unlinkedContent"].length;
        });
        document.getElementById("kb-count").innerHTML = "" + kbCount;
        document.getElementById("refreshButton").innerHTML = refreshButtonText;
        document.getElementById("none-message").style.display = "none";
        document.getElementById("linkKBsButton").disabled = false;
    } else {
        document.getElementById("none-message").style.display = "block";
        document.getElementById("none-message").innerHTML = noneKBsMsg;
        document.getElementById("un-kb-table").style.display = "none";
        document.getElementById("linkKBsButton").disabled = true;
        document.getElementById("kb-count").innerHTML = "0";
        document.getElementById("topic-count").innerHTML = "" + topicKBMap.length;
        document.getElementById("refreshButton").innerHTML = refreshButtonText;
    }
    }

    function clearScreen() {
    document.getElementById("kb-count").innerHTML = "";
    document.getElementById("topic-count").innerHTML = "";
    }
