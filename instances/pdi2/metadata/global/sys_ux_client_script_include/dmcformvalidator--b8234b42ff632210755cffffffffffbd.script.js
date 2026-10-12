function include({ imports }) {

    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { RULE_TYPE, MESSAGE_TYPE, STATE } = imports["global.DMClientConstants"]();
    const { getFormattedMessage, UI_MESSAGE, BR_TRANSFORM_MESSAGE, pushMessage, removeMessage } = imports["global.DMClientMessageHandler"]();
    // Utility functions
    function getStage(selectedTabId) {
        return selectedTabId.split(".")[1];
    }
    function getFormValidatorJson(api) {
        return deepClone(api.state[STATE.FORM_VALIDATOR_JSON]);
    }
    function getSelectedTabId(api) {
        return deepClone(api.state[STATE.SELECTED_TAB_ID]);
    }
    function getFieldValidatorJson(formValidatorJson, stage, name) {
        return formValidatorJson[stage][name];
    }
    function setFieldInvalid(fieldValidatorJson, message) {
        fieldValidatorJson.isInvalid = true;
        fieldValidatorJson.message = message;
    }
    function setFieldValid(fieldValidatorJson, message) {
        fieldValidatorJson.isInvalid = false;
        fieldValidatorJson.message = message;
    }
    // Validation functions
    const validateMandatoryField = async ({ api, helpers, eventPayload, formValidatorJson, stage, fieldValidatorJson }) => {
        const { value, name } = eventPayload;
        if (fieldValidatorJson.mandatory && !value) {
            setFieldInvalid(
                fieldValidatorJson,
                {
                    content: await getFormattedMessage(api, helpers, UI_MESSAGE.MANDATORY_FIELDS_MESSAGE, name),
                    status: MESSAGE_TYPE.CRITICAL
                }
            );
            pushMessage(api, helpers, {
                message: await getFormattedMessage(api, helpers, UI_MESSAGE.MANDATORY_FIELDS_MESSAGE),
                type: MESSAGE_TYPE.CRITICAL
            });
        } else {
            setFieldValid(
                fieldValidatorJson,
                {
                    content: '',
                    status: ''
                }
            );
            removeMessage(api, helpers, {
                message: await getFormattedMessage(api, helpers, UI_MESSAGE.MANDATORY_FIELDS_MESSAGE),
                type: MESSAGE_TYPE.CRITICAL
            });
        }
        formValidatorJson[stage][name] = fieldValidatorJson;
        return { isValid: !fieldValidatorJson.isInvalid, formValidatorJson: formValidatorJson };
    }


    function validateOneTimeDeleteQueryCondition(api, eventPayload) {
        const json = getFormValidatorJson(api);
        const uiElement = getFieldValidatorJson(json, getStage(getSelectedTabId(api)), eventPayload.name);
        const { value: encodedQuery } = eventPayload || {};
        if (uiElement) uiElement.isInvalid = !encodedQuery
        return { isValid: !!encodedQuery, formValidatorJson: json };
    }

    function validateTargetExecutionTime(api, eventPayload) {
        // At this point we do not need client side validation for schedule target time.
        const json = getFormValidatorJson(api);
        return { isValid: true, formValidatorJson: json };
    }

    // FieldValidator object
    const FieldValidator = {
        "name": async (api, helpers, eventPayload) => {
            const formValidatorJson = getFormValidatorJson(api);
            const selectedTabId = getSelectedTabId(api);
            const stage = getStage(selectedTabId);
            const fieldValidatorJson = getFieldValidatorJson(formValidatorJson, stage, eventPayload.name);
            return await validateMandatoryField({ api, helpers, eventPayload, formValidatorJson, stage, fieldValidatorJson });
        },

        "conditions": async (api, helpers, eventPayload) => {
            return validateOneTimeDeleteQueryCondition(api, eventPayload);
        },

        "run_at": async (api, helpers, eventPayload) => {
            return validateTargetExecutionTime(api, eventPayload);
        },

        "default": async (api, helpers, eventPayload) => {
            return { isValid: true, formValidatorJson: getFormValidatorJson(api) };
        }
    };
    // Main FormValidator object
    const _formValidator = {
        validateField: async (api, helpers, eventPayload) => {
            const validatorFunc = FieldValidator[eventPayload.name] || FieldValidator["default"];
            return await validatorFunc(api, helpers, eventPayload);
        },
        validateState: async (api, helpers) => {
            const {
                isValid,
                formValidatorJson
            } = await _formValidator.validatePage(api, helpers);
            if (!isValid) return { isValid, formValidatorJson };
            // Age field validation
            const ageFieldValidity = deepClone(api.state[STATE.AGE_FIELD_VALIDITY]);
            if (ageFieldValidity.days == false || ageFieldValidity.hours == false || ageFieldValidity.minutes == false || ageFieldValidity.seconds == false) {
                return { isValid: false, formValidatorJson };
            }
            // Check if Destroy Archive Duration is Invalid
            if (api.state[STATE.SELECTED_RULE_TYPE] == RULE_TYPE.ARCHIVE) {
                const destroyValidity = deepClone(api.state[STATE.DESTROY_DURATION_VALIDITY]);
                if (!destroyValidity.days || !destroyValidity.hours || !destroyValidity.minutes || !destroyValidity.seconds) {
                    return { isValid: false, formValidatorJson };
                }
            }
            // If partial query, show alert and donot proceed with save
            const query = deepClone(api.state[STATE.PARTIAL_QUERY_ALERT]);
            if (!query.isValid) {
                query.hide = false;
                api.setState(STATE.PARTIAL_QUERY_ALERT, query);
                return { isValid: false, formValidatorJson };
            }
            // Check if Scheduled Execution Time is valid for One time Delete
            if (api.state[STATE.SELECTED_RULE_TYPE] == RULE_TYPE.ONETIME_DELETE) {
                if (!(api.state[STATE.EXECUTION_TIME_ALERT].isValid)) {
                    return { isValid: false, formValidatorJson };
                }
            }
            return { isValid: true, formValidatorJson };
        },
        validatePage: async (api, helpers) => {
            const selectedRuleType = deepClone(api.state[STATE.SELECTED_RULE_TYPE]);
            var formValidator = getFormValidatorJson(api);
            const selectedTabId = getSelectedTabId(api);
            const stage = getStage(selectedTabId);
            const pageValidatorJson = formValidator[stage];
            const ruleData = deepClone(api.state[STATE.RULE_DATA]);
            let isPageValid = true;
            for (const name of Object.keys(pageValidatorJson)) {
                const value = ruleData[selectedRuleType][name];
                const eventPayload = { name, value };
                const fieldValidatorJson = formValidator[stage][name];
                const validatorFunc = FieldValidator[eventPayload.name] || FieldValidator["default"];
                if (validatorFunc) {
                    if (fieldValidatorJson.mandatory) {
                        const { isValid, formValidatorJson } = await validatorFunc(api, helpers, eventPayload);
                        if (!isValid) {
                            isPageValid = false;
                        }
                        formValidator = formValidatorJson;
                    }
                }
            }
            return { isValid: isPageValid, formValidatorJson: formValidator };
        },
        isAgeLessThan24Hours: (years, days, hours, minutes, seconds) => {
            if (!years && !days && !hours && !minutes && !seconds) return false;
            const hoursNum = Number(hours) || 0;
            const daysNum = Number(days) || 0;
            const yearsNum = Number(years) || 0;
            const minutesNum = Number(minutes) || 0;
            const secondsNum = Number(seconds) || 0;
            const totalSecs = yearsNum * 31536000 + daysNum * 86400 + hoursNum * 3600 + minutesNum * 60 + secondsNum;
            return totalSecs > 0 && totalSecs < 86400;
        },
    };
    return { FormValidator: _formValidator };
}
