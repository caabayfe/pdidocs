var tableName = '';
var data = [];

var categoryTypes = [];
var pageLeftData = {};
var pageRightData = {};
var isCategoryDataFetched = {};
var currentSelected = '';
var pageState = {};
var disassociateFlag = true;
var associateFlag = true;

gel('slush_left').onclick = function(e) {
    var selectedItem = e.target.text;

    if (selectedItem != '')
        gel('selected_item_text').textContext = selectedItem;
};

gel('slush_right').onclick = function(e) {
    var selectedItem = e.target.text;
    if (selectedItem != '')
        gel('selected_item_text').textContext = selectedItem;
};
gel('slush_left').addEventListener('dblclick', function(e) {
    processRightMove();
});
gel('slush_right').addEventListener('dblclick', function(e) {
    processLeftMove();
});

gel('slush_left').addEventListener('keydown', function(e) {
    if (e.keyCode == '39')
        processRightMove();
});
gel('slush_right').addEventListener('keydown', function(e) {
    if (e.keyCode == '37')
        processLeftMove();
});

gel('slush_search_box').onkeyup = function(e) {
    filterData(e.target.value);
};
gel('slush-bucket-add1').addEventListener('click', function(e) {
    processRightMove();
});
gel('slush-bucket-remove1').addEventListener('click', function(e) {
    processLeftMove();
});
gel('slush_source').addEventListener('change', function(e) {

    gel('slush_search_box').value = '';
    pageState[currentSelected + '_left'] = getFilteredData(pageState[currentSelected + '_left'], '');
    gel('slush_right_label').innerHTML = getMessage("{0} Categories").withValues([(categoryTypes.find(findCurrentCategoryType)).name]);
    currentSelected = getMessage(gel('slush_source').value);
    if (!isCategoryDataFetched[gel('slush_source').value]) {
        getCategoriesOfType(categoryTypes.find(findCurrentCategoryType));
    } else {
        addLeftChoices(pageState[gel('slush_source').value + '_left']);
    }

    if (!isCategoryDataFetched[gel('slush_source').value]) {
        getAssociatedCategories();
    } else {
        addRightChoices(pageState[gel('slush_source').value + '_right']);
    }
});

function processRightMove() {
    pageState[gel('slush_source').value + '_left'] = getLeftRemainedData(pageState[gel('slush_source').value + '_left']);
    if (gel('slush_left').options.length <= 0) {
        gel('slush_search_box').value = '';
        addLeftChoices(pageState[gel('slush_source').value + '_left']);
    }
    pageState[gel('slush_source').value + '_right'] = getChoices(gel('slush_right').options);
}

function processLeftMove() {
    clearFilter();
    pageState[gel('slush_source').value + '_left'] = getChoices(gel('slush_left').options);
    pageState[gel('slush_source').value + '_right'] = getChoices(gel('slush_right').options);
}

function getChoices(options) {
    var tempData = [];
    for (var i = 0; i < options.length; i++) {
        tempData.push({
            value: options[i].value,
            text: options[i].text,
            plainValue: options[i].text.toLowerCase()
        });
    }
    return tempData;
}

function findCurrentCategoryType(catalogType) {
    return catalogType.cat_value === gel('slush_source').value;
}

//Called when the 'OK' button gets clicked
function continueOK() {
    var topicId = g_form.getUniqueValue();

    var categories = gel('slush_source').options;
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i].value;
        if (pageState[category + '_right'] && pageState[category + '_right'].length > 0) {
            var cats = pageState[category + '_right'].map(function(e) {
                return e.value;
            });
            if (pageRightData[category] && pageRightData[category].length > 0) {
                cats = cats.filter(function(el) {
                    return (pageRightData[category].map(
                        function(a) {
                            return a.value;
                        }
                    )).indexOf(el) < 0;
                });
            }
            var vals = cats.join();
            if (vals && cats && cats != '') {
                var ajax = new GlideAjax('ContentAssociationUtilAjax');
                ajax.addParam('sysparm_name', 'fireAssociationEvent');
                ajax.addParam('sysparm_table', (categoryTypes[i]).cat_table);
                ajax.addParam('sysparm_topic', topicId);
                ajax.addParam('sysparm_values', vals);
                ajax.getXML(addCategoriesResponse);
            }
        }

        if (pageState[category + '_left'] && pageState[category + '_left'].length > 0) {
            var lCats = pageState[category + '_left'].map(function(e) {
                return e.value;
            });
            if (pageLeftData[category] && pageLeftData[category].length > 0) {
                lCats = lCats.filter(function(el) {
                    return (pageLeftData[category].map(
                        function(a) {
                            return a.value;
                        }
                    )).indexOf(el) < 0;
                });
            }
            var lVals = lCats.join();
            if (lVals && lCats && lCats != '') {
                var ajax2 = new GlideAjax('ContentAssociationUtilAjax');
                ajax2.addParam('sysparm_name', 'fireDisassociationEvent');
                ajax2.addParam('sysparm_topic', topicId);
                ajax2.addParam('sysparm_table', categoryTypes[i].cat_table);
                ajax2.addParam('sysparm_values', lVals);
                ajax2.getXML(disassociateCategoriesResponse);
            }
        }
    }
    GlideDialogWindow.get().destroy();
}
//Called when we get a response from the 'continueOK' function
function addCategoriesResponse() {
    if (associateFlag)
        g_form.addInfoMessage(getMessage("We are adding the content from your selected categories to this topic through an event"));
    associateFlag = false;
    return false;
}
//Called when we get a response from the 'continueOK' function
function disassociateCategoriesResponse() {
    if (disassociateFlag)
        g_form.addInfoMessage(getMessage("We are disassociating the content from your removed categories on this topic through an event"));
    disassociateFlag = false;
    return false;
}
//Called when the 'Cancel' button gets clicked
function continueCancel() {
    //Close the dialog window
    GlideDialogWindow.get().destroy();
    return false;
}
function clearFilter() {
    gel('slush_search_box').value = '';
    var prevLeftData = pageState[gel('slush_source').value + '_left'];
    var currentLeftData = getChoices(gel('slush_left').options);
    var newValIndexes = [];
    slush.clearSelect(slush.getLeftSelect());
    for (var i = 0; i < prevLeftData.length; i++) {
        var item = prevLeftData[i];
        for (var j = 0; j < currentLeftData.length; j++) {
            if (currentLeftData[j].value === prevLeftData[i].value) {
                newValIndexes.push(j);
                break;
            }
        }
    }
    addLeftChoices(prevLeftData);
    var current = 0;
    for (var i = 0; i < currentLeftData.length; i++) {
        if (newValIndexes[current] == i) {
            current++;
            continue;
        }
        slush.addLeftChoice(currentLeftData[i].value, currentLeftData[i].text);
    }
}
function filterData(filterText) {
    data = pageState[gel('slush_source').value + '_left'];
    var filteredData = getFilteredData(data, filterText.toLowerCase());
    fillSlushLeft(filteredData);
}
function getLeftRemainedData(filteredData) {
    var selectedValues = slush.getValues(slush.getRightSelect());
    var tempData = [];
    for (var i = 0; i < filteredData.length; i++) {
        var item = filteredData[i];
        if (!selectedValues.includes(item.value)) {
            tempData.push({
                value: item.value,
                text: item.text,
                plainValue: item.text.toLowerCase()
            });
        }
    }
    return tempData;
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
    categoryTypes = getCategoryTypes();
    if (categoryTypes && categoryTypes.length > 0) {
        setSelectOption(categoryTypes);
        currentSelected = categoryTypes[0].cat_value;
        gel('slush_right_label').innerHTML = getMessage("{categoryName} Categories", {categoryName: categoryTypes[0].name});
        getAssociatedCategories();
        getCategoriesOfType(categoryTypes[0]);
        return false;
    }
    return false;
});
function getCategoriesOfType(catalogType) {
    var ajax1 = new GlideAjax('ContentAssociationUtilAjax');
    ajax1.addParam('sysparm_name', 'getUnAssociatedCategories');
    ajax1.addParam('sysparm_table', catalogType.cat_table);
    ajax1.addParam('sysparm_content_table', ((categoryTypes || []).find(findCurrentCategoryType)).content_table);
    ajax1.addParam('sysparm_content_type', gel('slush_source').value);
    ajax1.addParam('sysparm_topic', g_form.getUniqueValue());
    slush.clear();
    ajax1.getXML(loadResponse);
}
//Add options of category types to select 
function setSelectOption(categoryTypes) {
    categoryTypes.forEach(function(item, index) {
        gel('slush_source').options[index] = new Option(item.name, item.cat_value);
    });
}
//Returns category types
function getCategoryTypes() {
    var ajax2 = new GlideAjax('ContentAssociationUtilAjax');
    ajax2.addParam('sysparm_name', 'getCategoryTypes');
    ajax2.getXML(function(response, catalog_types) {
        if (response) {
            var xml = response.responseXML;
            var e = xml.documentElement;
            data = [];
            var items = xml.getElementsByTagName("item");
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                data.push({
                    cat_value: item.getAttribute('cat_value'),
                    name: item.getAttribute('name'),
                    cat_table: item.getAttribute('cat_table'),
                    content_table: item.getAttribute('content_table')
                });
            }
            reassignCategoryTypes(data);	
        }
    });
}

function reassignCategoryTypes (data) {
    var categoryTypesFetched = data;
    this.categoryTypes = categoryTypesFetched;
    setSelectOption(categoryTypesFetched);
    currentSelected = categoryTypesFetched[0].cat_value;
    gel('slush_right_label').innerHTML = getMessage("{0} Categories").withValues([categoryTypesFetched[0].name]);
    getAssociatedCategories();
    getCategoriesOfType(categoryTypesFetched[0]);
}

function getAssociatedCategories() {
    var topicId = g_form.getUniqueValue();
    var ajax1 = new GlideAjax('ContentAssociationUtilAjax');
    ajax1.addParam('sysparm_name', 'getAssociatedCategories');
    ajax1.addParam('sysparm_content_type', gel('slush_source').value);
    ajax1.addParam('sysparm_topic', topicId);
    ajax1.addParam('sysparm_content_table', ((categoryTypes || []).find(findCurrentCategoryType)).content_table);
    slush.clear();
    ajax1.getXML(loadResponse2);
}

function loadResponse2(response) {
    var xml = response.responseXML;
    var e = xml.documentElement;
    var data2 = [];
    var items = xml.getElementsByTagName("item");

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.getAttribute('value') && item.getAttribute('value') != '') {
            data2.push({
                value: item.getAttribute('value'),
                text: item.getAttribute('text'),
                plainValue: item.getAttribute('text').toLowerCase()
            });
        }
    }

    pageRightData[gel('slush_source').value] = JSON.parse(JSON.stringify(data2));
    pageState[gel('slush_source').value + '_right'] = pageRightData[gel('slush_source').value];
    addRightChoices(pageRightData[gel('slush_source').value]);

}

function addRightChoices(choices) {
    gel('slush_right').length = 0;
    if (choices && choices.length > 0) {
        choices.forEach(function(item, index) {
            slush.addRightChoice(item.value, item.text);
        });
    }
}

function addLeftChoices(choices) {
    gel('slush_left').length = 0;
    if (choices && choices.length > 0) {
        choices.forEach(function(item, index) {
            slush.addLeftChoice(item.value, item.text);
        });
    }
}
//Called when we get a response from the 'addLoadEvent' function
function loadResponse(response) {
    //Process the return XML document and add groups to the left select
    var xml = response.responseXML;
    var e = xml.documentElement;
    data = [];
    var items = xml.getElementsByTagName("item");
    //Loop through item elements and add each item to left slushbucket
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        data.push({
            value: item.getAttribute('value'),
            text: item.getAttribute('text'),
            plainValue: item.getAttribute('text').toLowerCase()
        });
    }
    addLeftChoices(data);
    pageLeftData[gel('slush_source').value] = JSON.parse(JSON.stringify(data));
    pageState[gel('slush_source').value + '_left'] = pageLeftData[gel('slush_source').value];
    isCategoryDataFetched[gel('slush_source').value] = true;
}
