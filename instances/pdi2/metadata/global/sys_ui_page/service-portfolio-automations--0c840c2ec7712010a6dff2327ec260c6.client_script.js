function submit() {
    var portfolioId = GlideModal.get().getPreference('sysparm_sys_id');
    var choices = getChoices();
    var numOfferings = getNumberOfOfferings();
    var ga = new GlideAjax('SPMClientUtilAjax');
    ga.addParam('sysparm_name', 'processModalChoices');
    ga.addParam('sysparm_portfolio', portfolioId);
    ga.addParam('sysparm_choices', JSON.stringify(choices));
    ga.addParam('sysparm_number_of_offerings', numOfferings);
    ga.getXMLAnswer(handleResponse);

    GlideModal.get().destroy();
}

function cancel() {
    GlideModal.get().destroy();
}

function handleResponse(response) {
    var answer = JSON.parse(response);
    for (var key in answer) {
        if (answer.hasOwnProperty(key)) {
            switch (key) {
                default:
                    break;
            }
        }
    }
}

function getChoices() {
    var checkBoxesHtml = document.getElementsByClassName('automation_check_box');
    return Array.prototype.map.call(checkBoxesHtml, function(checkBoxHtml) {
        return ({
            name: checkBoxHtml.name,
            value: checkBoxHtml.checked
        });
    });
}

function getNumberOfOfferings() {
    var numberOfOfferingsHtml = document.getElementById('offerings_per_service');
    return numberOfOfferingsHtml.value;
}

function toggleNumberOfOfferingsDisplay() {
    if (document.getElementById('add_offerings_to_services').checked == false) {
        document.getElementById('offerings_per_service_span').style.display = 'none';
        document.getElementById('offerings_per_service_label').style.display = 'none';
    } else {
        document.getElementById('offerings_per_service_span').style.display = '';
        document.getElementById('offerings_per_service_label').style.display = '';
    }
}
