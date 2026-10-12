var tableName = '';
var data = [];

gel('slush_left').onclick = function(e) {
	var selectedItem = e.target.text;
	if(selectedItem != '')
          gel('selected_item_text').innerText = selectedItem ;
};

gel('slush_right').onclick = function(e) {
    var selectedItem = e.target.text;
	if(selectedItem != '')
          gel('selected_item_text').innerText = selectedItem ;
};

gel('slush_search_box').onkeyup = function(e) {
    filterData(e.target.value);
};

//Called when the 'OK' button gets clicked
function continueOK() {
    //Get the selected values from the right slushbucket
    var selectedValues = slush.getValues(slush.getRightSelect());
    var topicId = g_form.getUniqueValue();

    if (selectedValues == '')
        return;
    //send the selected categories to backend
    var ajax = new GlideAjax('ContentAssociationUtilAjax');
    ajax.addParam('sysparm_name', 'fireAssociationEvent');
    ajax.addParam('sysparm_table', tableName);
    ajax.addParam('sysparm_topic', topicId);
    ajax.addParam('sysparm_values', selectedValues);
    ajax.getXML(addCategoriesResponse);
}

//Called when we get a response from the 'continueOK' function
function addCategoriesResponse() {
    GlideDialogWindow.get().destroy();
    g_form.addInfoMessage(getMessage("We are adding the content from your selected categories to this topic through an event"));
    return false;
}

//Called when the 'Cancel' button gets clicked
function continueCancel() {
    //Close the dialog window
    GlideDialogWindow.get().destroy();
    return false;
}

function filterData(filterText) {
    var filteredData = getFilteredData(data, filterText.toLowerCase());
    fillSlushLeft(filteredData);
}

function fillSlushLeft(filteredData) {
    var selectedValues = slush.getValues(slush.getRightSelect());
    slush.clearSelect(slush.getLeftSelect());
    for (var i = 0; i < filteredData.length; i++) {
        var item = filteredData[i];
        if (!selectedValues.includes(item.value))
            slush.addLeftChoice(item.value, item.text);
    }
}

function getFilteredData(data, filter) {
    var filteredData = [];
    if (filter.length == 0)
        return data;
    for (var i = 0; i < data.length; i++) {
        if (filter.startsWith('*') && filter.length > 1 && data[i].plainValue.includes(filter.substr(1)))
            filteredData.push({
                value: data[i].value,
                text: data[i].text
            });
        else if (data[i].plainValue.startsWith(filter))
            filteredData.push({
                value: data[i].value,
                text: data[i].text
            });
    }
    return filteredData;
}

//Called when the form loads
addLoadEvent(function() {
    tableName = (gel('table_name').value);
    slush.clear();
    var ajax1 = new GlideAjax('ContentAssociationUtilAjax');
    ajax1.addParam('sysparm_name', 'getCategories');
    ajax1.addParam('sysparm_table', tableName);
    ajax1.getXML(loadResponse);
    return false;
});

//Called when we get a response from the 'addLoadEvent' function
function loadResponse(response) {
    slush.clear();
    //Process the return XML document and add groups to the left select
    var xml = response.responseXML;
    var e = xml.documentElement;

    data = [];

    var items = xml.getElementsByTagName("item");
    if (items.length == 0)
        return;

    //Loop through item elements and add each item to left slushbucket
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        data.push({
            value: item.getAttribute('value'),
            text: item.getAttribute('text'),
            plainValue: item.getAttribute('text').toLowerCase()
        });
        slush.addLeftChoice(item.getAttribute('value'), item.getAttribute('text'));
    }
}
