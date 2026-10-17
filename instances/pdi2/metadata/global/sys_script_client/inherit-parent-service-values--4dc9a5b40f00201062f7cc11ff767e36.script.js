var constants = {
    PARENT: 'parent',
    CONSUMER_TYPE: 'consumer_type',
    INTERNAL: 'internal',
    BOTH: 'both'
};

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Hide 'Internal and External' option for Consumer type
    g_form.removeOption(constants.CONSUMER_TYPE, constants.BOTH);

    // Use GlideAjax to fetch values from the offering's parent service record
    var ga = new GlideAjax('SPMClientUtilAjax');
    ga.addParam('sysparm_name', 'getParentServiceFieldValues');
    if (isLoading || newValue === '') {
        ga.addParam('sysparm_serviceId', g_form.getValue(constants.PARENT));
        ga.getXMLAnswer(_handleResponse);
    } else {
        ga.addParam('sysparm_serviceId', newValue);
        ga.getXMLAnswer(_handleResponse);
    }
}

function _handleConsumerType(consumerType) {
    if (consumerType === '' || consumerType == null)
        g_form.setValue(constants.CONSUMER_TYPE, constants.INTERNAL);
    else if (consumerType !== constants.BOTH)
        g_form.setValue(constants.CONSUMER_TYPE, consumerType);
}

function _handleResponse(response) {
    var answer = JSON.parse(response);
    for (var key in answer) {
        if (answer.hasOwnProperty(key)) {
            switch (key) {
                case 'consumer_type':
                    _handleConsumerType(answer[key]);
                    break;
                default:
                    if (g_form.getValue(key) === '') {
                        g_form.setValue(key, answer[key]);
                    }
            }
        }
    }
}
