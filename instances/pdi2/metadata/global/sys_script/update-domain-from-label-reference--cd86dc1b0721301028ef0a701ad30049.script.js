(function executeRule(current, previous /*null when async*/ ) {
    var sysDomain;
    var labelTable = current.getValue('label_table');
    if (labelTable === 'sys_nlu_intent')
        sysDomain = current.label_reference.model && current.label_reference.model.sys_domain;
    else if (labelTable === 'sys_nlu_model')
        sysDomain = current.label_reference.sys_domain;

    if (sysDomain)
        current.sys_domain = sysDomain;
})(current, previous);
