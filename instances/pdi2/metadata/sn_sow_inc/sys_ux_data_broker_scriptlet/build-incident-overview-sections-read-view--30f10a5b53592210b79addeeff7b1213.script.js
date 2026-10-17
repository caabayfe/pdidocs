function transform(input) {
    function setVisible(fields, fieldName, value) {
        if (fields[fieldName]) {
            fields[fieldName].visible = value;
        }
    }

    function setReadOnly(fields, fieldName, value) {
        if (fields[fieldName]) {
            fields[fieldName].readonly = value;
        }
    }

    function processFields(fields, section) {
        if (section == "resolution") {
            if (fields.close_code && fields.close_code.value == "Duplicate") {
                setVisible(fields, "parent_incident", true);
            } else {
                setVisible(fields, "parent_incident", false);
            }
        }
        if (section == "summary") {
            if (fields.major_incident_state && fields.major_incident_state.value) {
                setVisible(fields, "major_incident_state", true);
            } else {
                setVisible(fields, "major_incident_state", false);
            }
        }
        setReadOnly(fields, 'number', true);
        setReadOnly(fields, 'opened_at', true);
    }

    function buildFieldsMap(fields, layout) {
        var sections = [];
        if (layout != null) {
            for (var section = 0; section < layout.length; section++) {
                var firstColumFields = [],
                    firstColumFieldsData = [],
                    secondColumFields = [],
                    secondColumFieldsData = [];
                firstColumFields = layout[section][0].fields;
                var singleColumn = true;
                if (layout[section][1] != null) {
                    singleColumn = false;
                    secondColumFields = layout[section][1].fields;
                }
                for (var j = 0; j < fields.length; j++) {
                    if (firstColumFields.includes(fields[j].name)) {
                        firstColumFieldsData.push(fields[j]);
                    }
                    if (secondColumFields != null && secondColumFields.includes(fields[j].name)) {
                        secondColumFieldsData.push(fields[j]);
                    }
                }
                var fieldsMap = {
                    'singleColumn': singleColumn,
                    'firstColumnData': firstColumFieldsData
                };
                if (secondColumFields != null) {
                    fieldsMap.secondColumnData = secondColumFieldsData;
                }
                sections.push(fieldsMap);
            }
        }
        return sections;
    }

    function buildSection(sectionLayout, formSections, fields) {
        var initialSummaryState = {
            summary: {
                "hideEmptyFields": ["description"]
            },
            resolution: {
                "hideEmptyFields": []
            },
            cause: {
                "hideEmptyFields": []
            },
            business_impact: {
                "hideEmptyFields": []
            },
            impact: {
                "hideEmptyFields": []
            }
        };

        var sectionsState = {};

        sectionLayout.forEach(section => {
            var sectionName = section.caption;
            if (!formSections.includes(sectionName) || !initialSummaryState[sectionName]) {
                return;
            }
            var requiredFields = [];
            var isSectionReadOnly = true;
            section.rows.forEach((rows) => {
                rows.forEach((row) => {
                    row.fields.forEach((field) => {
                        if (!field.includes('.')) {
                            requiredFields.push(field);
                        }
                        // Check if any field in the section is not readonly
                        if (isSectionReadOnly && fields[field] && !fields[field].readonly) {
                            isSectionReadOnly = false;
                        }
                    });
                });
            });

            var fieldValues = [];
            requiredFields.forEach(fieldName => {
                var propsField = fields[fieldName];
                if (!propsField || !propsField.visible) {
                    return;
                }

                var hideEmptyFields = initialSummaryState[sectionName].hideEmptyFields;
                if (!propsField.displayValue && hideEmptyFields && hideEmptyFields.includes(fieldName)) {
                    return;
                }
                var fieldValue = {};
                fieldValue.name = propsField.name;
                fieldValue.label = propsField.label;
                fieldValue.table = propsField.reference;
                fieldValue.sysId = propsField.referenceSysId;

                if (propsField.type == 'html') {
                    fieldValue.value = {
                        'type': 'html',
                        'value': propsField.displayValue || '--'
                    };
                } else if (propsField.type == 'reference' && propsField.displayValue) {
                    fieldValue.value = {
                        "field": "reference",
                        "type": "text-link",
                        "label": propsField.displayValue,
                        "href": "javascript:void(0)",
                        "value": propsField.sysId,
                        "data": propsField
                    };
                } else if(propsField.type == 'url' && propsField.displayValue){
                        fieldValue.value = {
                            "field":"url",
                            "type":"text-link",
                            "label": propsField.displayValue,
                            "href": propsField.displayValue,
                            "value": propsField.displayValue,
                            "opensWindow":true,
                            "data": propsField
                    };
                } else {
                    fieldValue.value = {
                        'type': 'string',
                        'value': propsField.displayValue || '--'
                    };
                }
                fieldValues.push(fieldValue);
            });
            var sectionState = initialSummaryState[sectionName];
            sectionState.fieldValues = fieldValues;
            sectionState.isSectionReadOnly = isSectionReadOnly;
            sectionState.formSections = [{
                rows: section.rows,
                id: 0
            }];
            sectionsState[sectionName] = sectionState;
        });
        return sectionsState;
    }

    function getOverviewFormSections() {
        var cards = getOverviewCards();
        var formSections = [];
        for (var card in cards) {
            for (var i = 0; i < cards[card].length; i++) {
                formSections.push(cards[card][i]);
            }
        }
        return Array.from(formSections);
    }

    function getOverviewCards() {
        return {
            "summary": ["summary"],
            "impact": ["impact", "business_impact"],
            "cause": ["cause"],
            "resolution": ["resolution"]
        };
    }

    function getFields(form) {
        var elementDataSet = form.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.elementsData;
        var fieldStates = form.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.fieldStates;
        var recordValues = form.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;
        var fields = {};
        recordValues.forEach(value => {
            var elementData = elementDataSet.find(data => data.name == value.name);
            if (!elementData) {
                return;
            }
            var fieldState = fieldStates.find(state => state.name == value.name);
            if (!fieldState) {
                fieldState = {
                    hidden: false,
                    name: value.name,
                    mandatory: false,
                    readonly: false
                };
            }
            fields[value.name] = Object.assign(value, elementData);
            fields[value.name] = Object.assign(fieldState, fields[value.name]);
            fields[value.name].type = elementData.dictionary.type;
            fields[value.name].visible = !fieldState.hidden;
            if (fields[value.name].type == 'reference') {
                fields[value.name].referenceSysId = value.value;
                fields[value.name].reference = elementData.reference;
            }
            fields[value.name].label = elementData.dictionary.label;
        });
        return fields;
    }

    var fieldsCopy = getFields(input.view);
    var formSections = getOverviewFormSections();
    for (var k = 0; k < formSections.length; k++) {
        processFields(fieldsCopy, formSections[k]);
    }
    var formData = input.view.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query;
    var sectionLayout = formData.formLayout.sectionLayout;
    var sectionObjects = buildSection(sectionLayout, formSections, fieldsCopy);

    //Build Summary section field values object as per the configured form layout    
    var summaryFields = sectionObjects.summary.fieldValues;
    var summaryLayout = sectionObjects.summary.formSections[0].rows;
    sectionObjects.summary.sections = buildFieldsMap(summaryFields, summaryLayout);

    var result = {
        summary: sectionObjects.summary,
        impact: sectionObjects.impact,
        business_impact: sectionObjects.business_impact,
        cause: sectionObjects.cause,
        resolution: sectionObjects.resolution
    };
    return result;
}
