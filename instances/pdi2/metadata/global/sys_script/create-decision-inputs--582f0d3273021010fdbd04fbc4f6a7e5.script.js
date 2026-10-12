(function executeRule(current, previous /*null when async*/ ) {

    var decisionTable = new GlideRecord("sys_decision_input");
    decisionTable.initialize();
    decisionTable.setValue('model', current.policy.decision_table);
    decisionTable.setValue('model_table', 'sys_decision');
    decisionTable.setValue('name', 'var__m_sys_decision_input_' + current.policy.decision_table);

    if (current.sys_auth_filter_criteria.sys_class_name == 'sys_generic_user_filter_criteria')
        setTypeForGenericUserFilterCriteria();
    else {
        //For Boolean True/False
        decisionTable.setValue('internal_type', 'boolean'); //reference type
        decisionTable.setDisplayValue('internal_type', 'True/False'); //reference type
    }

    decisionTable.setValue('label', current.sys_auth_filter_criteria.name);
    decisionTable.setValue('element', current.sys_auth_filter_criteria.element_name);
    decisionTable.insert();

    function setTypeForGenericUserFilterCriteria() {

        var filterType = current.sys_auth_filter_criteria.type;
        if (filterType == 'identity_provider') {
            //For Refernce type
            decisionTable.setValue('internal_type', 'reference');
            decisionTable.setValue('reference', 'sso_properties');

        } else if (filterType == 'auth_scheme') {
            //For Choice type
            createAuthSchemeChoiceRecords();
            decisionTable.setValue('internal_type', 'choice');
            decisionTable.setValue('choice', '3'); //show dropdown without None

        } else if (filterType == 'idp_attribute') {
            var type = getIDPAttributeType();
            createIDPAttributeRecord(type);

        } else {
            //For Boolean True/False
            decisionTable.setValue('internal_type', 'boolean');
            decisionTable.setDisplayValue('internal_type', 'True/False');
        }
    }


    function createAuthSchemeChoiceRecords() {
        //Provide inputs for choice records
        createChoiceRecord('Username and Password' , 'local', '1');
        createChoiceRecord('Single Sign-On' , 'multisso', '2');
    }

	function createChoiceRecord(label, value, sequence) {
        //create choice record with given inputs
        choiceTable = new GlideRecord("sys_choice");
        choiceTable.setValue('name', 'var__m_sys_decision_input_' + current.policy.decision_table);
        choiceTable.setValue('element', current.sys_auth_filter_criteria.element_name);
        choiceTable.setValue('label', label);
        choiceTable.setValue('value', value);
        choiceTable.setValue('sequence', sequence);
        choiceTable.insert();
    }

    function getIDPAttributeType() {
        var idpAttrGR = new GlideRecord("idp_attribute");
        if (idpAttrGR.isValid()) {
            idpAttrGR.addQuery("friendly_name", current.sys_auth_filter_criteria.name);
            idpAttrGR.query();
            if (idpAttrGR.next())
                return idpAttrGR.type;
        }
    }

    function createIDPAttributeRecord(type) {
        if (type == "integer") {
            decisionTable.setValue('internal_type', 'integer');
            decisionTable.setDisplayValue('internal_type', 'Integer');
        } else if (type == "boolean") {
            decisionTable.setValue('internal_type', 'boolean');
            decisionTable.setDisplayValue('internal_type', 'True/False');
        } else {
            decisionTable.setValue('internal_type', 'string');
            decisionTable.setDisplayValue('internal_type', 'String');
            //DEF0458975: To support lengthier IDP Attributes for "idp_attribute" type filter criteria. The default size is 40.
            decisionTable.setValue('max_length', 100);
        }
    }

})(current, previous);
