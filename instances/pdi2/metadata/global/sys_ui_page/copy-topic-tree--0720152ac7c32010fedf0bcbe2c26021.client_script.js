$j(function() {
    $j(document).ready(function() {
        $j("#taxonomyField").select2();
        $j("#topicField").select2({
            placeholder: "Select a state",
            allowClear: true
        });
    });
    updateTopicField();
});

function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    var result;
    if (type == 'ok') {
        if (gel(taxonomyField).value == '')
            $j("#taxonomy_err_message").css("display", "block");
        else
            result = gdw.getPreference('onPromptComplete');
    }
    if (type == 'cancel')
        result = gdw.getPreference('onPromptCancel');


    if (typeof(result) == 'function') {
        try {
            result.call(gdw, gdw.getPreference('oldValue'));
        } catch (e) {}
        gdw.destroy();
    }
    return false;
}

function updateTopicField() {
    $j("#topicField").select2("val", "");
    $j("#topicField").empty();
    var emptyOption = {
        html: 'None',
        value: '',
        selected: true
    };
    $j("#topicField").append($j("<option>", emptyOption));
    var taxonomyId = gel('taxonomyField').value;
    var loadingDialog = new GlideDialogWindow("dialog_loading", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle(getMessage('Loading'));
    loadingDialog.render();
    getTopics(taxonomyId).then(function() {
        loadingDialog.destroy();
    });
}

function getTopics(selectedTaxonomy) {
    return new Promise(function(resolve, reject) {
        var errorMessageElem = $j("#err_message");
        var ga = new GlideAjax('TopicList');
        ga.addParam('sysparm_name', 'getTaxonomyTopics');
        ga.addParam('sysparm_taxonomyId', selectedTaxonomy);
        ga.getXML(function(response) {
            if (response) {
                var result = response.responseXML.documentElement.getAttribute("answer");
                if (result.length > 0) {
                    var topics = JSON.parse(result);
                    for (var i = 0; i < topics.length; i++) {
                        var option = {
                            text: topics[i].name,
                            value: topics[i].id,
                            selected: false
                        };
                        $j("#topicField").append($j("<option>", option));
                    }
                }
            }
			resolve();
        });
    });
}
