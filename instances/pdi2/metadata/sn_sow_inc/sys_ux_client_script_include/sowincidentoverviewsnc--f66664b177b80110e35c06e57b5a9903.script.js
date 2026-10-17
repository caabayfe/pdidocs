function include({
    imports
}) {
    class SowIncidentOverviewSNC {

        static setValue(api, fields, fieldName, value, displayValue) {
            if (fields[fieldName]) {
                api.emit("GFORM#SET_VALUE", {
                    fieldName: fieldName,
                    value: value
                });
            }
        }
        static setVisible(fields, fieldName, value) {
            if (fields[fieldName]) {
                fields[fieldName] = {
                    ...fields[fieldName],
                    'visible': value
                }
            }
        }
        static setReadOnly(fields, fieldName, value) {
            if (fields[fieldName]) {
                fields[fieldName] = {
                    ...fields[fieldName],
                    'readonly': value
                }
            }
        }
        static setFocus(buttonId, helpers, timer) {
            helpers.timing.setTimeout(() => {
                helpers.focus(buttonId);
            }, timer);
        }
        static processFields(fields, section) {

            if (section == "resolution") {
                if (fields.close_code && fields.close_code.value == "Duplicate") {
                    this.setVisible(fields, "parent_incident", true);
                } else {
                    this.setVisible(fields, "parent_incident", false);
                }
            }
            if (section == "summary") {
                if (fields.major_incident_state && fields.major_incident_state.value) {
                    this.setVisible(fields, "major_incident_state", true);
                } else {
                    this.setVisible(fields, "major_incident_state", false);
                }
            }
            this.setReadOnly(fields, 'number', true);
            this.setReadOnly(fields, 'opened_at', true);
        }

        static async onFieldChange(api, helpers, fields, fieldName, value, displayValue) {
            if (value && fieldName == "parent_incident" && (fields.close_notes && (fields.close_notes.value == "" || fields.close_notes.value == api.state.generatedResolutionNotes))) {
                var message = await helpers.translate("{0} is marked as a duplicate of {1}", [fields.number.value, displayValue]);
                this.setValue(api, fields, "close_notes", message);
                api.setState('generatedResolutionNotes', message);
            } else if (fieldName == "close_code" &&
                value != 'Duplicate' &&
                (fields.close_notes && fields.close_notes.value == api.state.generatedResolutionNotes)) {
                this.setValue(api, fields, "close_notes", "");
                api.setState('generatedResolutionNotes', '');
            } else if (fieldName == "close_code" &&
                value == 'Duplicate' &&
                fields.parent_incident.value != "" &&
                (fields.close_notes && fields.close_notes.value == "")) {
                message = await helpers.translate("{0} is marked as a duplicate of {1}", [fields.number.value, fields.parent_incident.displayValue]);
                this.setValue(api, fields, "close_notes", message);
                api.setState('generatedResolutionNotes', message);
            }
        }

        static buildSection(api, sectionLayout, formSections, fields, sectionConfig) {
            sectionLayout.forEach(section => {
                let sectionName = section.caption;
                if (!formSections.includes(sectionName) || !api.state.sectionConfig[sectionName])
                    return;
                let requiredFields = [];
                let isSectionReadOnly = true;
                section.rows.forEach((rows) => {
                    rows.forEach((row) => {
                        row.fields.forEach((field) => {
                            if (!field.includes('.'))
                                requiredFields.push(field);
                            // Check if any field in the section is not readonly
                            if (isSectionReadOnly && fields[field] && !fields[field].readonly) {
                                isSectionReadOnly = false;
                            }
                        });
                    });
                });

                let fieldValues = [];
                requiredFields.forEach(fieldName => {
                    const propsField = fields[fieldName];
                    if (!propsField || !propsField.visible)
                        return;

                    let hideEmptyFields = api.state.sectionConfig[sectionName].hideEmptyFields;
                    if (!propsField.displayValue && hideEmptyFields && hideEmptyFields.includes(fieldName))
                        return;

                    let fieldValue = {};
                    fieldValue.name = propsField.name
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
                            "type": "text-link",
                            "label": propsField.displayValue,
                            "href": "javascript:void(0)",
                            "value": propsField.sysId,
                            "data": propsField
                        };
                     } else if (propsField.type == 'url' && propsField.displayValue) {
                        fieldValue.value = {
                            "field":"url",
                            "type": "text-link",
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

                sectionConfig[sectionName] = {
                    ...api.state.sectionConfig[sectionName],
                    fields: requiredFields,
                    fieldValues: fieldValues,
                    isSectionReadOnly: isSectionReadOnly,
                    formSections: [{
                        rows: section.rows,
                        id: 0
                    }]
                };
            });
        }

        static async translateToggleTooltipText(helpers, sectionConfig) {
            var sectionNames = Object.keys(sectionConfig);
            for (var i = 0; i < sectionNames.length; i++) {
                let toggleTooltipText = "";
                let expanded = sectionConfig[sectionNames[i]].expanded;
                switch (sectionNames[i]) {
                    case "summary":
                        toggleTooltipText = expanded ? await helpers.translate("Collapse Summary") : await helpers.translate("Expand Summary");
                        break;
                    case "impact":
                        toggleTooltipText = expanded ? await helpers.translate("Collapse Impact") : await helpers.translate("Expand Impact");
                        break;
                    case "cause":
                        toggleTooltipText = expanded ? await helpers.translate("Collapse Cause") : await helpers.translate("Expand Cause");
                        break;
                    case "resolution":
                        toggleTooltipText = expanded ? await helpers.translate("Collapse Resolution") : await helpers.translate("Expand Resolution");
                        break;
                }
                if (toggleTooltipText) {
                    sectionConfig[sectionNames[i]] = {
                        ...sectionConfig[sectionNames[i]],
                        toggleTooltipText: toggleTooltipText
                    };
                }
            }
        }

        static getOverviewFormSections() {
            var cards = this.getOverviewCards();
            var formSections = new Set();
            for (var card in cards) {
                for (var i = 0; i < cards[card].length; i++) {
                    formSections.add(cards[card][i]);
                }
            }
            return Array.from(formSections);
        }

        static getOverviewCards() {
            return {
                "summary": ["summary"],
                "impact": ["impact", "business_impact"],
                "cause": ["cause"],
                "resolution": ["resolution"]
            }
        }

        static getImpactDBDebounceThreshold() {
            var debounceThresholdInMS = 1000;
            return debounceThresholdInMS;
        }
        static checkAddButtonVisibility(sectionName, fields) {
            let addBtnVisible = true;
            if (sectionName == "cause") {
                if (fields.cause && fields.cause.value != "") {
                    addBtnVisible = false;
                }
            }
            if (sectionName == "resolution") {
                if ((fields.close_code && fields.close_code.value != "") ||
                    (fields.close_notes && fields.close_notes.value != "")
                ) {
                    addBtnVisible = false;
                }
            }
            return addBtnVisible;
        }
        static setFocusForSaveBtn(section, helpers, fieldsCopy) {
            if (section == "summary") {
                this.setFocusOnClick("summary_save", helpers, fieldsCopy);
            } else if (section == "impact") {
                this.setFocusOnClick("impact_save", helpers, fieldsCopy);
            } else if (section == "cause") {
                this.setFocusOnClick("cause_save", helpers, fieldsCopy);
            } else
                this.setFocusOnClick("resolution_save", helpers, fieldsCopy);
        }
        static setFocusOnClick(buttonId, helpers, fields) {
            let addBtnVisible = true;
            switch (buttonId) {
                case "button_edit":
                    this.setFocus("summary_save", helpers, 200);
                    break;
                case "summary_save":
                case "summary_cancel":
                    this.setFocus("button_edit", helpers, 200);
                    break;
                case "impact_edit":
                    this.setFocus("impact_save", helpers, 200);
                    break;
                case "impact_save":
                case "impact_close":
                    this.setFocus("impact_edit", helpers, 200);
                    break;
                case "cause_add":
                case "cause_edit":
                    this.setFocus("cause_save", helpers, 200);
                    break;
                case "cause_save":
                case "cause_cancel":
                    addBtnVisible = this.checkAddButtonVisibility("cause", fields);
                    if (addBtnVisible) {
                        this.setFocus("cause_add", helpers, 400);
                    } else {
                        this.setFocus("cause_edit", helpers, 400);
                    }
                    break;
                case "resolution_add":
                case "resolution_button_edit":
                    this.setFocus("resolution_save", helpers, 200);
                    break;
                case "resolution_save":
                case "resolution_cancel":
                    addBtnVisible = this.checkAddButtonVisibility("resolution", fields);
                    if (addBtnVisible) {
                        this.setFocus("resolution_add", helpers, 400);
                    } else {
                        this.setFocus("resolution_button_edit", helpers, 400);
                    }
                    break;
            }
        }

        static isInitialLoadOutdated(eagerSectionData, latestSectionData) {
            if (!eagerSectionData || !latestSectionData) {
                return;
            }
            if ((eagerSectionData.fieldValues.length != latestSectionData.fieldValues.length)
                || (eagerSectionData.isSectionReadOnly != latestSectionData.isSectionReadOnly)) {
                return true;
            }
            var fieldsEagerData = {};
            for (let i = 0; i < eagerSectionData.fieldValues.length; i++) {
                fieldsEagerData[eagerSectionData.fieldValues[i].name] = eagerSectionData.fieldValues[i].value;
            }
            var fieldsLatestData = {};
            for (let i = 0; i < latestSectionData.fieldValues.length; i++) {
                fieldsLatestData[latestSectionData.fieldValues[i].name] = latestSectionData.fieldValues[i].value;
            }
            for (let key of Object.keys(fieldsLatestData)) {
                if (!fieldsEagerData.hasOwnProperty(key)) {
                    return true;
                }
                let latestValue = fieldsLatestData[key].type == "text-link" ? fieldsLatestData[key].label : fieldsLatestData[key].value;
                let eagerValue = fieldsEagerData[key].type == "text-link" ? fieldsEagerData[key].label : fieldsEagerData[key].value;
                if (eagerValue != latestValue) {
                    return true;
                }
            }
            return false;
        }
    }
    return SowIncidentOverviewSNC;
}
