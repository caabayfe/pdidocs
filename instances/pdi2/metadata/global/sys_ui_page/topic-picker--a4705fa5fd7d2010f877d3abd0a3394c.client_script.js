$j(function() {
	addTaxonomyChangeListener();
	fetchTaxonomies();
	$j('#body_kb_categories_dialog .btn.btn-primary.category-ok-btn').attr('disabled', true);
});

function addTaxonomyChangeListener() {
    $j('#taxonomy').change(function() {
        getTopics(this.value);
    });
}

function fetchTaxonomies() {
    var errorMessageElem = $j("#err_message");
    var ga = new GlideAjax('ContentAuthoringAjax');
    ga.addParam('sysparm_name', 'getTaxonomies');
    ga.addParam('sysparm_table', "knowledge");
    ga.getXML(function(serverResponse) {
        if ((serverResponse.status > 199 && serverResponse.status < 300) || (serverResponse.status == "" )) {
            var result = serverResponse.responseXML.getElementsByTagName("result");
            if (result.length > 0 && result[0].getAttribute("taxonomy")) {
                var taxonomy = JSON.parse(result[0].getAttribute("taxonomy"));
                var taxonomySelect = $j('#taxonomy');
                for (var i = 0; i < taxonomy.length; i++) {
                    var optionElement = $j('<option></option>')
                        .attr('value', taxonomy[i].id)
                        .text(taxonomy[i].name);
                    taxonomySelect.append(optionElement);
                }
                if (taxonomy.length > 0) {
                    $j("#taxonomy").val(taxonomy[0].id);
                    getTopics(taxonomy[0].id);
                }
            }
        } else {
            errorMessageElem.html("${gs.getMessage('Error in getting taxonomies')}");
            errorMessageElem.css("display", "block");
        }
    });
}

function createContentMappingWithTopic() {
    var errorMessageElem = $j("#err_message");
    if ($j("#topicId").val().length == 0) {
        errorMessageElem.html("${gs.getMessage('Please select a topic')}");
        errorMessageElem.css("display", "block");
        return;
    } else {
        var topicPickerCallback = new Function("return $[topicPickerCallback]")();
        topicPickerCallback();
    }
}

function getTopics(selectedTaxonomy) {
    var errorMessageElem = $j("#err_message");
    var taxonomyTopicJSON = $j('#taxonomyTopicJSON');
    var ga = new GlideAjax('ContentAuthoringAjax');
    ga.addParam('sysparm_name', 'getTaxonomyTopics');
    ga.addParam('sysparm_taxonomyId', selectedTaxonomy);
    ga.getXML(function(serverResponse) {
        if (serverResponse.status > 199 && serverResponse.status < 300 || (serverResponse.status == "" )) {
            var result = serverResponse.responseXML.getElementsByTagName("result");
            if (result.length > 0) {
                var topics = result[0].getAttribute("topics");
                if (topics) {
                    $j('#taxonomyTopicJSON-columnview-container').remove();
                    taxonomyTopicJSON.columnview({
                        jsonData: JSON.parse(topics),
                        maxWidth: getCompatibleColumnWidth(),
                        blockEditing: true,
                        onChange: onClickTopic
                    }).bind({
                        columnview_select: function(ev, obj) {
                            $j("#topicId").val(obj.id); // hidden field located at component level: gets destroyed with the component.
                        }
                    });
                    $j('.list-item').on('click', function() {
                        $j('#body_kb_categories_dialog .btn.btn-primary.category-ok-btn').attr('disabled', false);
                    });
                }
            }
        } else {
            errorMessageElem.html("${gs.getMessage('Error in getting topics for the selected taxonomy')}");
            errorMessageElem.css("display", "block");
        }
    });
}

function getCompatibleColumnWidth() {
    if (window.frameElement && window.frameElement.id == "dialog_frame")
        return (window.frameElement.getWidth() * 0.75); // Resize if displayed from a dialog
    else
        return 700; // Default value for content width
}

function onClickTopic() {
    $j('.column.last-column').css("display", "none");
}
