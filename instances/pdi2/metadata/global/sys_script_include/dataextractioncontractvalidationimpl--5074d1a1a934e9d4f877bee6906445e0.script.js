var DataExtractionContractValidationImpl = Class.create();
DataExtractionContractValidationImpl.prototype = {
    initialize: function() {
        this.CONTRACT_VALIDATION_ERRORS = {};
        this.UTIL = new DataExtractionUtil();
        this.CONSTANTS = new global.DataExtractionConstants();
    },

    // All JSON validations.
    isJSONValid: function(contract, useCase) {

        if (gs.nil(contract) || !this.UTIL.isJSONObject(contract)) {
            this.addError("CONTRACT_DEFINITION_ERROR", "No valid contract was provided");
            return this.getJSONError();
        }

        try {

            // converting just the keys to upper case to avoid errors while validating encodedqueries (case sensitive)
            contract = this.UTIL.ConvertContractKeysToUpperCase(contract);

            //validating if the contract has USECASE key. USECASE won't be mandatory in the contract.
            if (this.UTIL.isValidJSONKey(contract, "USE_CASE") &&
                this.CONSTANTS.SUPPORTED_USE_CASES.hasOwnProperty(contract.USE_CASE.toUpperCase()))
                useCase = contract.USE_CASE.toUpperCase();

            //get useCase based in the contract
            if (gs.nil(useCase))
                useCase = this.getUseCase(contract);

            if (!this.CONSTANTS.SUPPORTED_USE_CASES.hasOwnProperty(useCase) ||
                useCase == this.CONSTANTS.UNKNOWN_TAG ||
                !this.isContractByUseCaseValid(contract, useCase))
                return this.getJSONError(useCase);

            if (GlideDomainSupport.isDataOrProcessSeparationEnabled() && this.UTIL.isValidJSONKey(contract, "DOMAIN_SYS_ID") && !this.UTIL.isValidDomain(contract.DOMAIN_SYS_ID)) {
                this.addError("CONTRACT_DEFINITION_ERROR", "The domain_sys_id " + contract.DOMAIN_SYS_ID + " is not valid.");
                return this.getJSONError(useCase);
            }

        } catch (err) {
            this.addError("CONTRACT_DEFINITION_ERROR", "Please check the contract definition");
            validJSON = false;
        }

        // All Glide validations.
        try {
            if (!this.hasReadAccess(contract, useCase) ||
                !this.areEncodedQueriesValid(contract, useCase) ||
                !this.areFieldsValid(contract, useCase))
                return this.getJSONError(useCase);

        } catch (err) {
            this.addError("SECURITY_ERROR", "Please check if you have read access to the tables, fields or if encodedQueries are valid " +
                err);
            return this.getJSONError(useCase);
        }

        return isValid = {
            "isValid": true,
            "useCase": useCase,
            "errors": {}
        };

    },

    getJSONError: function(useCase) {
        return {
            "isValid": false,
            "useCase": gs.nil(useCase) ? this.CONSTANTS.UNKNOWN_TAG : useCase,
            "errors": this.CONTRACT_VALIDATION_ERRORS
        };
    },

    //Identify the use case based in the target, source and join objects in the contract
    //Inputs: (JSON) required. contract that describes the use case and extra features to query
    getUseCase: function(contract) {

        var useCase = this.CONSTANTS.UNKNOWN_TAG;
        try {
            if (!this.UTIL.isValidJSONKey(contract, "TARGET") ||
                !this.UTIL.isValidJSONKey(contract.TARGET, "TABLE")) {
                this.addError("USE_CASE_ERROR", "TARGET.TABLE is mandatory for all use cases.");

            } else if (!this.UTIL.isValidJSONKey(contract, "SOURCE") ||
                !this.UTIL.isValidJSONKey(contract.SOURCE, "TABLE")) {
                useCase = "SINGLE_TABLE";

            } else if (!this.UTIL.isValidJSONKey(contract.SOURCE, "TABLE") ||
                !this.UTIL.isValidJSONKey(contract.SOURCE, "JOIN") ||
                !this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TARGET_ID_FIELD")) {
                this.addError("USE_CASE_ERROR", "SOURCE,SOURCE.JOIN and SOURCE.JOIN.TARGET_ID_FIELD are mandatory if TWO_TABLE_JOIN.");

            } else if (!this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TABLE") ||
                contract.SOURCE.TABLE == contract.SOURCE.JOIN.TABLE) {
                useCase = "TWO_TABLE_JOIN";

            } else if (!this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "SOURCE_ID_FIELD")) {
                this.addError("USE_CASE_ERROR", "SOURCE.JOIN.SOURCE_ID_FIELD is mandatory if TWO_TABLE_JOIN_M2M.");

            } else if (contract.SOURCE.TABLE != contract.SOURCE.JOIN.TABLE) {
                useCase = "TWO_TABLE_JOIN_WITH_M2M";

            } else {
                this.addError("USE_CASE_ERROR", "Unknown error");
            }
        } catch (err) {
            this.addError("USE_CASE_ERROR", "Unknown error");
        }
        return useCase;
    },

    //Check for all the important keys in the contract according to use case
    isContractByUseCaseValid: function(contract, useCase) {

        if (gs.nil(contract) || gs.nil(useCase)) {
            this.addError("CONTRACT_DEFINITION_ERROR", "No contract or useCase was provided");
            return false;
        }

        var validContract = true;
        switch (useCase) {
            case "SINGLE_TABLE":
                // just features or other_features are mandatory
                if ((!this.UTIL.isValidJSONKey(contract.TARGET, "FEATURES") ||
                        contract.TARGET.FEATURES.length <= 0) &&
                    (!this.UTIL.isValidJSONKey(contract.TARGET, "OTHER_FEATURES") ||
                        contract.TARGET.OTHER_FEATURES.length <= 0)) {
                    validContract = false;
                    this.addError("CONTRACT_DEFINITION_ERROR", "TARGET.FEATURES or TARGET.OTHER_FEATURES are mandatory for SINGLE_TABLE");
                }
                break;

            case "TWO_TABLE_JOIN":
            case "TWO_TABLE_JOIN_WITH_M2M":
                // features or other_features are mandatory to be present in either source or target
                 if (!this.UTIL.isValidJSONArrayKey(contract.TARGET, "FEATURES") &&
					!this.UTIL.isValidJSONArrayKey(contract.TARGET, "OTHER_FEATURES") &&
					!this.UTIL.isValidJSONArrayKey(contract.SOURCE, "FEATURES") &&
                    !this.UTIL.isValidJSONArrayKey(contract.SOURCE, "OTHER_FEATURES")) {
                    validContract = false;
                    this.addError("CONTRACT_DEFINITION_ERROR", "SOURCE.FEATURES or SOURCE.OTHER_FEATURES are mandatory for TWO_TABLE_JOIN");
                }

                if (this.UTIL.isValidJSONArrayKey(contract.SOURCE, "OTHER_FEATURES")) {
                    var isOtherFeaturesInSourceValid = this.otherFeaturesValidations(contract.SOURCE.OTHER_FEATURES, "KEY");
                    if (!isOtherFeaturesInSourceValid)
                        validContract = false;
                }
                break;
        }

        // validating other features
        if (this.UTIL.isValidJSONArrayKey(contract.TARGET, "OTHER_FEATURES")) {
            var isOtherFeaturesInTargetValid = this.otherFeaturesValidations(contract.TARGET.OTHER_FEATURES, "KEY");
            if (!isOtherFeaturesInTargetValid)
                validContract = false;
        }

        if ((this.UTIL.isValidJSONKey(contract.TARGET, "ORDER") &&
                !this.CONSTANTS.ORDER_TYPES.hasOwnProperty(contract.TARGET.ORDER))) {
            validContract = false;
            this.addError("CONTRACT_DEFINITION_ERROR", "TARGET.ORDER is not supported");
        }

        return validContract;
    },

    //Security check for all tables in the contract
    hasReadAccess: function(contract, useCase) {

        if (gs.nil(contract)) {
            this.addError("SECURITY_ERROR", "No contract was provided.");
            return false;
        }

        var hasAccess = true;

        if (!this.UTIL.hasTableAccess(contract.TARGET.TABLE)) {
            this.addError("SECURITY_ERROR", "No read access for TARGET.TABLE. " + contract.TARGET.TABLE);
            hasAccess = false;
        }

        // validating access to other features for target
        if (this.UTIL.isValidJSONArrayKey(contract.TARGET, "OTHER_FEATURES") &&
            !this.otherFeaturesValidations(contract.TARGET.OTHER_FEATURES, "ACCESS")) {
            hasAccess = false;
        }

        if (useCase == "TWO_TABLE_JOIN" || useCase == "TWO_TABLE_JOIN_WITH_M2M") {
            if (this.UTIL.isValidJSONKey(contract.SOURCE, "TABLE") &&
                !this.UTIL.hasTableAccess(contract.SOURCE.TABLE)) {
                this.addError("SECURITY_ERROR", "No read access for SOURCE.TABLE. " + contract.SOURCE.TABLE);
                hasAccess = false;

            }
            // validating access to other features for source
            if (this.UTIL.isValidJSONKey(contract.SOURCE, "OTHER_FEATURES") &&
                contract.SOURCE.OTHER_FEATURES.length > 0 &&
                !this.otherFeaturesValidations(contract.SOURCE.OTHER_FEATURES, "ACCESS")) {
                hasAccess = false;
            }
        }

        if (useCase == "TWO_TABLE_JOIN_WITH_M2M") {
            if (this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TABLE") &&
                (contract.SOURCE.TABLE != contract.SOURCE.JOIN.TABLE) &&
                !this.UTIL.hasTableAccess(contract.SOURCE.JOIN.TABLE)) {
                this.addError("SECURITY_ERROR", "No read access for the M2M table SOURCE.JOIN.TABLE. " + contract.SOURCE.JOIN.TABLE);
                hasAccess = false;
            }
        }

        return hasAccess;
    },

    //Security check for encodedQueries. 
    areEncodedQueriesValid: function(contract, useCase) {
        var encodedQueryValid = true;

        if (this.UTIL.isValidJSONKey(contract.TARGET, "ENCODED_QUERY") &&
            this.UTIL.isValidJSONKey(contract.TARGET, "TABLE") &&
            !this.UTIL.isValidEncodedQuery(contract.TARGET.TABLE, contract.TARGET.ENCODED_QUERY)
        ) {
            this.addError("SECURITY_ERROR", "TARGET.ENCODED_QUERY is invalid, remember encodedQueries are case sensitive. " +
                contract.TARGET.ENCODED_QUERY);
            encodedQueryValid = false;
        }

        if (this.UTIL.isValidJSONArrayKey(contract.TARGET, "OTHER_FEATURES") &&
            !this.otherFeaturesValidations(contract.TARGET.OTHER_FEATURES, "ENCODED_QUERY")) {
            encodedQueryValid = false;
        }

        if (useCase == "TWO_TABLE_JOIN" || useCase == "TWO_TABLE_JOIN_WITH_M2M") {
            if (this.UTIL.isValidJSONKey(contract.SOURCE, "ENCODED_QUERY") &&
                this.UTIL.isValidJSONKey(contract.SOURCE, "TABLE") &&
                !this.UTIL.isValidEncodedQuery(contract.SOURCE.TABLE, contract.SOURCE.ENCODED_QUERY)
            ) {
                this.addError("SECURITY_ERROR", "SOURCE.ENCODED_QUERY is invalid, remember encodedQueries are case sensitive. " +
                    contract.SOURCE.ENCODED_QUERY);
                encodedQueryValid = false;
            }
            if (this.UTIL.isValidJSONKey(contract.SOURCE, "TABLE") &&
                this.UTIL.isValidJSONArrayKey(contract.SOURCE, "OTHER_FEATURES") &&
                !this.otherFeaturesValidations(contract.SOURCE.OTHER_FEATURES, "ENCODED_QUERY")) {
                encodedQueryValid = false;
            }
        }

        if (useCase == "TWO_TABLE_JOIN_WITH_M2M") {
            if (this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "ENCODED_QUERY") &&
                this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TABLE") &&
                !this.UTIL.isValidEncodedQuery(contract.SOURCE.JOIN.TABLE, contract.SOURCE.JOIN.ENCODED_QUERY)
            ) {
                this.addError("SECURITY_ERROR", "SOURCE.JOIN.ENCODED_QUERY is invalid, remember encodedQueries are case sensitive. " +
                    contract.SOURCE.JOIN.ENCODED_QUERY);
                encodedQueryValid = false;
            }
        }

        return encodedQueryValid;
    },

    //Security check for fields in the contract
    areFieldsValid: function(contract, useCase) {
        var fieldsValid = true;

        var fieldsToEvaluate = [];
        if (this.UTIL.isValidJSONKey(contract.TARGET, "LABELS"))
            fieldsToEvaluate = fieldsToEvaluate.concat(contract.TARGET.LABELS);

        if (this.UTIL.isValidJSONKey(contract.TARGET, "FEATURES"))
            fieldsToEvaluate = fieldsToEvaluate.concat(contract.TARGET.FEATURES);

        if (fieldsToEvaluate.length > 0 &&
            !this.UTIL.areFieldsValid(contract.TARGET.TABLE, fieldsToEvaluate)) {
            this.addError("SECURITY_ERROR", "TARGET.LABELS or TARGET.FEATURES are invalid. " + fieldsToEvaluate.toString());
            fieldsValid = false;
        }

        if (this.UTIL.isValidJSONArrayKey(contract.TARGET, "OTHER_FEATURES") &&
            !this.otherFeaturesValidations(contract.TARGET.OTHER_FEATURES, "FIELDS")) {
            fieldsValid = false;
        }

        if (useCase != "SINGLE_TABLE") {
            fieldsToEvaluate = [];

            if (this.UTIL.isValidJSONArrayKey(contract.SOURCE, "FEATURES")) {
                if (!this.UTIL.areFieldsValid(contract.SOURCE.TABLE, contract.SOURCE.FEATURES)) {
                    this.addError("SECURITY_ERROR", " SOURCE.FEATURES are invalid. " + contract.SOURCE.FEATURES.toString());
                    fieldsValid = false;
                }
            }
            if (useCase == "TWO_TABLE_JOIN") {
                fieldsToEvaluate.push(contract.SOURCE.JOIN.TARGET_ID_FIELD);
                if (this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TARGET_TABLE_FIELD"))
                    fieldsToEvaluate.push(contract.SOURCE.JOIN.TARGET_TABLE_FIELD);

                if (fieldsToEvaluate.length > 0 &&
                    !this.UTIL.areFieldsValid(contract.SOURCE.TABLE, fieldsToEvaluate)) {
                    this.addError("SECURITY_ERROR", " SOURCE.FEATURES, SOURCE.JOIN.TARGET_ID_FIELD or SOURCE.JOIN.TARGET_TABLE_FIELD are invalid. " +
                        fieldsToEvaluate.toString());
                    fieldsValid = false;
                }
            }

            if (useCase == "TWO_TABLE_JOIN_WITH_M2M") {
                fieldsToEvaluate.push(contract.SOURCE.JOIN.TARGET_ID_FIELD);
                fieldsToEvaluate.push(contract.SOURCE.JOIN.SOURCE_ID_FIELD);
                if (this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "TARGET_TABLE_FIELD"))
                    fieldsToEvaluate.push(contract.SOURCE.JOIN.TARGET_TABLE_FIELD);
                if (this.UTIL.isValidJSONKey(contract.SOURCE.JOIN, "SOURCE_TABLE_FIELD"))
                    fieldsToEvaluate.push(contract.SOURCE.JOIN.SOURCE_TABLE_FIELD);
                if (fieldsToEvaluate.length > 0 &&
                    !this.UTIL.areFieldsValid(contract.SOURCE.JOIN.TABLE, fieldsToEvaluate)) {
                    this.addError("SECURITY_ERROR", "SOURCE.FEATURES, SOURCE.JOIN.TARGET_ID_FIELD, SOURCE.JOIN.SOURCE_ID_FIELD, SOURCE.JOIN.TARGET_TABLE_FIELD or SOURCE.JOIN.SOURCE_TABLE_FIELD are invalid.");
                    fieldsValid = false;
                }
            }

            if (this.UTIL.isValidJSONArrayKey(contract.SOURCE, "OTHER_FEATURES") &&
                !this.otherFeaturesValidations(contract.SOURCE.OTHER_FEATURES, "FIELDS")) {
                fieldsValid = false;
            }
        }

        return fieldsValid;
    },

    //validation for other_features objects
    otherFeaturesValidations: function(otherFeatures, validationType) {
        if (gs.nil(otherFeatures) || otherFeatures.length == 0 || gs.nil(validationType))
            return false;

        var valid = true;

        for (var i = 0; i < otherFeatures.length; i++) {
            var otherFeature = otherFeatures[i];
            var otherFeatureTable = this.UTIL.getOtherFeatureTable(otherFeature);

            switch (validationType) {
                case "KEY":
                    if (!this.isOtherFeatureValid(otherFeature))
                        valid = false;
                    break;
                case "ACCESS":
                    if (!this.UTIL.hasTableAccess(otherFeatureTable)) {
                        this.addError("SECURITY_ERROR", "No read access to SOURCE.OTHER_FEATURES.TABLE. " + otherFeatureTable);
                        valid = false;
                    }
                    break;
                case "ENCODED_QUERY":
                    if (this.UTIL.isValidJSONKey(otherFeature, "ENCODED_QUERY") &&
                        !this.UTIL.isValidEncodedQuery(otherFeatureTable, otherFeature.ENCODED_QUERY)) {
                        this.addError("SECURITY_ERROR", "OTHER_FEATURES.ENCODED_QUERY is invalid, remember encodedQueries are case sensitive. " + otherFeature.ENCODED_QUERY);
                        valid = false;
                    }
                    break;

                case "FIELDS":
                    if (this.UTIL.isValidJSONKey(otherFeature, "FEATURE") &&
                        (!this.UTIL.areFieldsValid(otherFeatureTable, otherFeature.FEATURE.split(" ")) ||
                            (!this.UTIL.areFieldsValid(otherFeatureTable, otherFeature.JOIN_ID_FIELD.split(" "))))) {
                        this.addError("SECURITY_ERROR", "OTHER_FEATURES.FEATURE or OTHER_FEATURES.JOIN_ID_FIELD are invalid. " +
                            otherFeature.FEATURE + "," + otherFeature.JOIN_ID_FIELD);
                        valid = false;
                    }
                    break;

                default:
                    valid = false;
            }
        }
        return valid;

    },

    //Validating indivual other_feature
    isOtherFeatureValid: function(otherFeature) {
        var otherFeatureValid = true;

        if (!this.UTIL.isValidJSONKey(otherFeature, "TYPE") ||
            !this.CONSTANTS.OTHER_FEATURES_TYPES.hasOwnProperty(otherFeature.TYPE)) {
            this.addError("CONTRACT_DEFINITION_ERROR", "OTHER_FEATURES.TYPE is not supported");
            return false;
        }

        switch (otherFeature.TYPE) {
            case "ATTACHMENT":
                if (this.UTIL.isValidJSONKey(otherFeature, "ATTACHMENT_TYPES")) {
                    var attachmentTypes = otherFeature.ATTACHMENT_TYPES;
                    for (i = 0; i < attachmentTypes.length; i++) {
                        if (!this.CONSTANTS.ALL_SUPPORTED_ATTACHMENT_TYPES.hasOwnProperty(attachmentTypes[i])) {
                            this.addError("CONTRACT_DEFINITION_ERROR", "OTHER_FEATURES.ATTACHMENT_TYPES " +
                                attachmentTypes[i] + " is not supported");
                            otherFeatureValid = false;
                        }
                    }
                }
                break;
            case "ARRAY":
                if (!this.UTIL.isValidJSONKey(otherFeature, "LABEL") ||
                    !this.UTIL.isValidJSONKey(otherFeature, "TABLE") ||
                    !this.UTIL.isValidJSONKey(otherFeature, "FEATURE") ||
                    !this.UTIL.isValidJSONKey(otherFeature, "JOIN_ID_FIELD")) {
                    this.addError("CONTRACT_DEFINITION_ERROR",
                        "OTHER_FEATURES.LABEL, OTHER_FEATURES.TABLE, OTHER_FEATURES.FEATURE or OTHER_FEATURES.JOIN_ID_FIELD are invalid");
                    otherFeatureValid = false;

                }
                break;
        }
        return otherFeatureValid;
    },

    //Adding errors to CONTRACT_VALIDATION_ERRORS and the log
    addError: function(type, message) {
        if (gs.nil(type) || !this.CONSTANTS.ERROR_TYPES.hasOwnProperty(type))
            type = this.CONSTANTS.UNKNOWN_TAG;

        message = this.CONSTANTS.ERROR_TYPES[type] + ". " + message;
        if (!this.CONTRACT_VALIDATION_ERRORS.hasOwnProperty(this.CONSTANTS.ERROR_TYPE_KEY)) {
            this.CONTRACT_VALIDATION_ERRORS[this.CONSTANTS.ERROR_TYPE_KEY] = type;
            this.CONTRACT_VALIDATION_ERRORS[this.CONSTANTS.ERROR_MESSAGE_KEY] = [message];
        } else {
            this.CONTRACT_VALIDATION_ERRORS[this.CONSTANTS.ERROR_MESSAGE_KEY].push(message);
        }
    },

    _debug: function(msg) {
        new DataExtractionDebugUtil().debug(msg);
    },

    type: 'DataExtractionContractValidationImpl'
};
