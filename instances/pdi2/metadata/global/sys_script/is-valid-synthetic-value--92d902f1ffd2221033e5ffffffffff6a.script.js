(function executeRule(current, previous /*null when async*/ ) {
    let hasError = false;
    try {
        const discoveryCommonUtil = new DiscoveryCommonUtilCore();

        if (discoveryCommonUtil.isDiscoveryFeatureSupportedForRelease() === "false") {
            const suppressionInfoMessage = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "Upgrade to the <a href='https://www.servicenow.com/docs/csh?topicname=data-discovery-landing.html&version=latest' target='_blank'> Yokohama platform </a> version to use synthetic data features.");
            gs.addInfoMessage(suppressionInfoMessage);
            throw new Error("Suppressed feature");
        }

        //If "Is Valid Regex" BR fails, return
        if (current.isActionAborted()) {
            return false;
        }

        const MAX_CHAR_COUNT = 8000;
        const MIN_SYNTHETIC_VALUES_COUNT = 10;
        const MAX_SYNTHETIC_VALUES_COUNT = 100;


        const syntheticValueString = GlideStringUtil.escapeHTML(current.synthetic_value.trim());

        //Return if empty synthetic value as it is optional
        if (syntheticValueString == "") return true;

        const charCount = syntheticValueString.length();

        //Validate character count
        if (charCount > MAX_CHAR_COUNT) {
            const errorMessage = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "<span><b>Character limit exceeded. </b></span> Your synthetic values have more than {count} characters. Please reduce the number of characters.", {
                count: MAX_CHAR_COUNT.toString()
            });
            gs.addErrorMessage(errorMessage);
            hasError = true;
        }

        const syntheticValueList = syntheticValueString.split("\r\n").filter((val) => {
            return (val != "" && val != null && val != undefined);
        });

        const uniqueSyntheticValueList = [...new Set(syntheticValueList)];

        //Validate duplicate synthetic values
        if (syntheticValueList.length != uniqueSyntheticValueList.length) {
            const infoMessage = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "<span><b>Duplicate synthetic values. </b></span>We removed {duplicateCount} duplicates. Please avoid repeating values.", {
                duplicateCount: (syntheticValueList.length - uniqueSyntheticValueList.length).toString()
            });
            gs.addInfoMessage(infoMessage);
        }
        //Validate synthetic values count
        if (uniqueSyntheticValueList.length < MIN_SYNTHETIC_VALUES_COUNT) {
            const errorMessage = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "<span><b>Insufficient synthetic values. </b></span>At least {minSyntheticValueCount} values must be entered for synthetic data replacement. Please add more to continue.", {
                minSyntheticValueCount: MIN_SYNTHETIC_VALUES_COUNT.toString()
            });
            gs.addErrorMessage(errorMessage);
            hasError = true;
        } else if (uniqueSyntheticValueList.length > MAX_SYNTHETIC_VALUES_COUNT) {
            const errorMessage = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "<span><b>Too many synthetic values. </b></span>You can only enter {maxSyntheticValueCount} values at a time. Please reduce the number of values to continue.", {
                maxSyntheticValueCount: MAX_SYNTHETIC_VALUES_COUNT.toString()
            });
            gs.addErrorMessage(errorMessage);
            hasError = true;
        }

        const dataPatternValidator = new SNC.DataPatternValidatorCore();
        const regex = current.expression;
        const invalidSyntheticValues = [];

        //Validate synthetic values against provided regex
        const trimmedValueList = uniqueSyntheticValueList.map((value) => {
            const trimmedValue = value.trim();
            if (!dataPatternValidator.exactMatches(regex, trimmedValue)) {
                invalidSyntheticValues.push(trimmedValue);
            }
            return trimmedValue;
        });

        if (invalidSyntheticValues.length > 0) {
            const err_msg = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "<span><b>Incorrect synthetic values. </b></span> The synthetic values entered do not match the regex pattern. Please reformat the values to match. <details><ul>{invalidSyntheticValuesList}</ul></details>", {
                invalidSyntheticValuesList: invalidSyntheticValues.map(val => `<li>${val}</li>`).join('')
            });
            gs.addErrorMessage(err_msg);
            hasError = true;
        }

        current.synthetic_value = trimmedValueList.join("\r\n");

        if (hasError) {
            current.setAbortAction(true);
            return false;
        }

    } catch (error) {
        gs.error("Error from 'Is Valid Synthetic Value' BR: " + error);
        current.setAbortAction(true);
        return false;
    }
})(current, previous);
