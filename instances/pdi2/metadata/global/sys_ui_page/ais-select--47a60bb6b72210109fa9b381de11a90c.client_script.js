var userQuery;
var resultsPerPage = 10;
var resultsCurPage = 0;
var prevFfilter = null;
var nextPageOffset = 0;
var selectedDocs = {};
var fRuleRecord = null;
var fProfileRecord = null;
var prevSelectedDocs = [];
var minOrder = 0;

function make_elem(elem, cls, id) {
    var e = document.createElement(elem);
    if (cls)
        e.className = cls;

    if (id)
        e.id = id;

    return e;
}

// Utils
function format(text, vars) {
    if (Array.isArray(vars)) {
        for (var i = 0; i < vars.length; i++) {
            text = text.replace("{" + i + "}", vars[i]);
        }
    } else {
        text = text.replace("{}", vars);
    }
    return text;
}


//// ID Management
function getRuleIDFromURI() {
    var params = decodeURIComponent(window.location.toString()).split("ais_rule.do?")[1];
    var rule = params.match("sys_id=(.*)")[1].slice(0, 32);
    return rule;
}

function getRecords() {
    fRuleRecord = getRecordById("ais_rule", getRuleIDFromURI());
    fProfileRecord = getRecordById("ais_search_profile", fRuleRecord.profile);
    var gr = new GlideRecord("ais_rule_action");
    gr.addQuery("rule", fRuleRecord.sys_id);
    gr.query();
    while (gr.next()) {
        if (gr.promote_doc)
            prevSelectedDocs.push(gr.promote_doc);
        else
            prevSelectedDocs.push(gr.block_doc);

        if (gr.order > minOrder)
            minOrder = gr.order;
    }
}

function getRecordById(table, id) {
    var gr = new GlideRecord(table);
    gr.addQuery("sys_id", id);
    gr.query();
    if (gr.next())
        return gr;
}

//// Document Selection
function addSelectedDocument(title, id) {
    selectedDocs[id] = title;
    document.getElementById(format("button-{}", id)).setAttribute("disabled", "");
    document.getElementById("selectedDocList").appendChild(renderSelectedDocument(id, title));
}

function removeSelectedDocument(id) {
    delete selectedDocs[id];
    var button = document.getElementById(format("button-{}", id));
    if (button)
        button.removeAttribute("disabled");

    document.getElementById("selectedDocList").removeChild(document.getElementById(id));
}

function renderSelectedDocument(id, title) {
    var removeDocButton = make_elem("input", "removeDocButton btn-destructive", null);
    removeDocButton.type = "button";
    removeDocButton.value = "X";
    removeDocButton.onclick = function() {
        removeSelectedDocument(id);
    };
    var removeDocButtonContainer = make_elem("div", "removeDocButtonContainer", null);
    removeDocButtonContainer.appendChild(removeDocButton);

    var selectedDocTitle = make_elem("span", "selectedDocTitle", null);
    selectedDocTitle.innerHTML = sanitizeWithHighlight(title);

    var selectedDocumentEntry = make_elem("div", "selectedDocumentEntry", id);
    selectedDocumentEntry.appendChild(selectedDocTitle);
    selectedDocumentEntry.appendChild(removeDocButtonContainer);
    return selectedDocumentEntry;
}

function renderSelectedDocuments() {
    document.getElementById('selectedDocsHeader').innerText = format('{} Selected Documents', Object.keys(selectedDocs).length);
    Array.from(Object.keys(selectedDocs)).forEach(function(key) {
        document.getElementById('selectedDocList').appendChild(renderSelectedDocument(key, selectedDocs[key]));
    })
}

function addAndClosePage(type) {
    addActions(type);
    GlideModal.get().destroy();
}

function makeID(document) {
    return [document.fields.table, document.sysId].join(".");
}

//// Result Rendering
function renderDocumentResult(document) {
    var id = makeID(document);
    var title = document.fields.title;
    var table = document.fields.table;
    var text = document.fields.text;
    disabled = null;
    if (selectedDocs[id] || prevSelectedDocs.includes(id))
        disabled = "disabled";

    var docResult = make_elem("div", "resultDocument", null);

    var addDocButton = make_elem("input", "addDocButton", format("button-{}", id));
    addDocButton.type = "button";
    addDocButton.value = "+";
    addDocButton.onclick = function() {
        addSelectedDocument(title, id);
    };
    if (disabled)
        addDocButton.disabled = true;

    var docTitle = make_elem("h4", "docTitle", null);
    docTitle.innerHTML = sanitizeWithHighlight(title);

    var resultTitle = make_elem("div", "resultTitle", null);
    resultTitle.appendChild(addDocButton);
    resultTitle.appendChild(docTitle);

    var resultMeta = make_elem("div", "resultMeta", null);
    var tableName = make_elem("em", null, null);
    tableName.innerText = table;
    var tableParagraph = make_elem("p", null, null);
    tableParagraph.appendChild(tableName);
    resultMeta.append(tableParagraph);

    var resultBody = make_elem("div", "resultBody", null);
    var bodyText = make_elem("p", null, null);
    bodyText.innerHTML = sanitizeWithHighlight(text);
    resultBody.appendChild(bodyText);

    docResult.appendChild(resultTitle);
    docResult.appendChild(resultMeta);
    docResult.appendChild(resultBody);

    var listelem = make_elem("li", null, null);
    listelem.appendChild(docResult);

    return listelem;
}

function addActions(type) {
    var ajax = new GlideAjax('AisCreateRuleDocActions');
    ajax.addParam("sysparm_name", "createActions");
    ajax.addParam("sysparm_ids", JSON.stringify(selectedDocs));
    ajax.addParam("sysparm_start_order", minOrder);
    ajax.addParam("sysparm_action_type", type);
    ajax.addParam("sysparm_rule", fRuleRecord.sys_id);

    ajax.getXMLWait();
    location.reload();
}

function keyPressSearch(event) {
    if (event.keyCode == 13) {
        searchBtn();
    }
}

function doSearch(query, noSpellCheck) {

    var ajax = new GlideAjax('AisCreateRuleDocActions');
    ajax.addParam("sysparm_name", "search");
    ajax.addParam("sysparm_search_profile", fProfileRecord.name);
    ajax.addParam("sysparm_query_offset", nextPageOffset);
    ajax.addParam("sysparm_query_locale", fRuleRecord.locale);
    ajax.addParam("sysparm_user_query", query);

    ajax.getXMLWait()
    var answer = ajax.getAnswer();
    displayResult(JSON.parse(answer), true);
}

function searchBtn() {
    nextPageOffset = 0;
    query = gel('query').value;
    userQuery = query;
    doSearch(query, false);
}

function displayResult(answer) {
    var resultList = '';
    var totalHits = answer.totalHits;
    var documents = answer.documents;
    resultsCurPage = answer.documents.length;

    var currentOffset = nextPageOffset;
    nextPageOffset = answer.nextPageOffset;
    document.getElementById('resultHeader').innerText = format('Showing results {0}-{1} of {2}', [currentOffset + 1, Math.min(nextPageOffset, totalHits), totalHits]);
    document.getElementById("resultList").innerHTML = resultList;
    document.getElementById('resultList').start = "" + (currentOffset + 1);

    for (var i = 0; i < documents.length; i++) {
        document.getElementById("resultList").appendChild(renderDocumentResult(documents[i]));
    }

    getPagination(totalHits);
}

function getPagination(totalHits) {
    if (!document.getElementById('paginator'))
        document.getElementById('content').appendChild(make_elem("div", "paginator", "paginator"));
    document.getElementById('paginator').innerHTML = "";
    var buttons = []
    if (nextPageOffset > resultsPerPage) {
        var prevPageButton = make_elem("a", null, null);
        prevPageButton.href = "#";
        prevPageButton.onclick = function() {
            prevPage();
        };
        prevPageButton.innerText = "Prev";
        buttons.push(prevPageButton);
    }
    if (nextPageOffset < totalHits) {
        var nextPageButton = make_elem("a", null, null);
        nextPageButton.href = "#";
        nextPageButton.onclick = function() {
            nextPage();
        };
        nextPageButton.innerText = "Next";
        buttons.push(nextPageButton);
    }
    for (var i = 0; i < buttons.length; i++) {
        document.getElementById('paginator').appendChild(buttons[i]);
    }
}

function setPage(newPage) {
    page = newPage;
    doSearch(userQuery, false);
}

function nextPage() {
    doSearch(userQuery, false);
}

function prevPage() {
    nextPageOffset -= (resultsCurPage + resultsPerPage);
    doSearch(userQuery, false);
}

function sanitizeWithHighlight(text) {
    var HIGHLIGHT_START = '___HIGHLIGHT_START___';
    var HIGHLIGHT_END = '___HIGHLIGHT_END___';
    var HIGHLIGHT_TAG_START = '<highlight>';
    var HIGHLIGHT_TAG_END = '</highlight>';

    if (!text) return '';

    var processed = text.split(HIGHLIGHT_TAG_START).join(HIGHLIGHT_START);
    processed = processed.split(HIGHLIGHT_TAG_END).join(HIGHLIGHT_END);

    processed = sanitizeHtml(processed);

    processed = processed.split(HIGHLIGHT_START).join(HIGHLIGHT_TAG_START);
    processed = processed.split(HIGHLIGHT_END).join(HIGHLIGHT_TAG_END);

    return processed;
}

renderSelectedDocuments();
getRecords();
