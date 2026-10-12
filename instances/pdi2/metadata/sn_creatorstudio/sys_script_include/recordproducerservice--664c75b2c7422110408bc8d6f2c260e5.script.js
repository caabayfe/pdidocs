const RecordProducerService = (function() {
    return class RecordProducerService {
        static type = "RecordProducerService";
        static #TABLE_NAME = "sc_cat_item_producer";
        static #STATES = Object.freeze({
            DRAFT: "draft",
            PUBLISHED: "published",
            REVIEWED: "reviewed",
            PUBLISHING: "publishing",
        });
        static RECORD_PRODUCER_BUILDER_SYS_ID = "3558cf50c7321010159ca1e603c2605b";
        static RECORD_SUBMISSION_VARIABLE_SYS_ID =
            "9faf5bdcc7321010159ca1e603c26023";
        static #QUESTION_SET_LAYOUTS = Object.freeze({
            ONECOLUMN: "normal",
            TWOCOLUMN_ALTERNATING: "2across",
            TWOCOLUMN_DOWNTHENOVER: "2down",
        });

        static #REQUEST_FORM_TABLE_MISMATCH = "REQUEST_FORM_TABLE_MISMATCH";

        /**
         * Get some default attributes to set for the record producer
         *
         * @returns an object
         */
        static #getDefaultAttributes() {
            return {
                active: false,
                state: RecordProducerService.#STATES.DRAFT,
            };
        }

        /**
         * Gets the item summary for the specified record producer.
         *
         * @param {string} sysId - the sysId of the record producer
         * @param {boolean} requireTableMatch - whether the record_table is required to match table_name
         * @returns {object} a mapping of record producer attribute values and variables
         */
        static #getCatItemSummary(sysId, requireTableMatch = false) {
            const grRecordProducer = RecordProducerService.#getById(sysId);

            if (requireTableMatch) {
                RecordProducerService.#checkRecordProducerTableMatchesAppTable(
                    grRecordProducer
                );
            }
            try {
                const catItem = new sn_sc.CatItem(sysId);
                const catItemSummary = catItem.getItemSummary();
                const variables = catItem.getVariables(false, false, false);
                const publishedRef = grRecordProducer.getValue("published_ref");
                const {
                    published_sys_updated_by,
                    published_sys_updated_on
                } =
                RecordProducerService.#getPublishedRecordProducerMetadata(
                    publishedRef
                );
                const variablesWithExtendedFields =
                    RecordProducerService.getVariablesWithExtendedFields(
                        sysId,
                        variables
                    );
                const pictureId = grRecordProducer.getValue("picture");
                const formImageUrl = pictureId ? `${pictureId}.iix?t=small` : '';

                return Object.freeze({
                    variables: variablesWithExtendedFields,
                    ...catItemSummary,
                    publishedRef,
                    scTemplateId: grRecordProducer.getValue("sc_template"),
                    scTemplateLabel: grRecordProducer.getDisplayValue("sc_template"),
                    published_sys_updated_on,
                    published_sys_updated_by,
                    hideAttachment: grRecordProducer.getValue("no_attachment_v2") === "1",
                    state: grRecordProducer.getDisplayValue("state"),
                    stateValue: grRecordProducer.getValue("state"),
                    formImageUrl
                });
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNKNOWN,
                    gs.getMessage("Failed to retrieve Record Producer")
                );
                throw error;
            }
        }

        /**
         * Deletes the pictures associated with the specified Record Producer
         *
         * @param {object} grRecordProducer - a GlideRecord containing the Record Producer record
         */
        static #deletePicture(grRecordProducer) {
            const attachmentSysId = grRecordProducer.getValue("picture");

            const gsa = new GlideSysAttachment();

            // Delete the attachments that have file_name "picture" that are associated with the record producer
            // by table name and its sys_id.  If these attachment records are not removed, the RecordProducer's "picture" field
            // displayValue may reference them, even when the field value is null.
            function deleteAttachments(tableName) {
                const grAttachments = gsa.getAttachments(
                    tableName,
                    grRecordProducer.getUniqueValue()
                );
                while (grAttachments.next()) {
                    if (grAttachments.canDelete()) {
                        if (
                            grAttachments.getValue("file_name") === "picture" ||
                            grAttachments.getUniqueValue() === attachmentSysId
                        ) {
                            gsa.deleteAttachment(grAttachments.getUniqueValue());
                        }
                    }
                }
            }

            deleteAttachments("ZZ_YY" + grRecordProducer.getTableName());
            deleteAttachments(grRecordProducer.getTableName());
        }

        /**
         * Checks that the specified picture is assignable to the specified Record Producer
         * An error is thrown if the picture attachment record does not exist or the
         * attachment record does not reference the Record Producer.
         *
         * @param {string} picture - sys_id of the attachment record that is being assigned
         * @param {object} grRecordProducer - a GlideRecord containing the Record Producer being assigned to
         *
         * @throws Error with errorType BAD_REQUEST if picture not assignable
         */
        static #checkPictureAssignableToRecordProducer(picture, grRecordProducer) {
            const grAttachment = new GlideRecordSecure("sys_attachment");

            if (!grAttachment.get(picture)) {
                throw new ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("The attachment record was not found")
                );
            }

            if (
                grAttachment.getValue("table_sys_id") !==
                grRecordProducer.getUniqueValue()
            ) {
                throw new ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("The attachment not assignable to this Record Producer")
                );
            }
        }

        /**
         * Returns the sysId for the checked out draft Record Producer equivalent to a given published record producer
         *
         * @param {object} grProducer - the published record producer
         * @returns {string} sysId of draft record producer
         */
        static #findDraftRecordProducerId(grProducer) {
            const isCheckedOut = grProducer.getValue("checked_out");
            if (isCheckedOut === "true") {
                let rpGR = new GlideRecordSecure(RecordProducerService.#TABLE_NAME);
                rpGR.addQuery("published_ref", grProducer.getValue("sys_id"));
                rpGR.query();
                if (rpGR.next()) return rpGR.getValue("sys_id");
                else {
                    throw new ErrorService.createError(
                        ErrorService.ERROR_TYPES.NOT_FOUND,
                        gs.getMessage(
                            "Not able to find checked out copy of Record Producer"
                        )
                    );
                }
            } else {
                try {
                    return sn_sc.CatalogItemVersioningService.checkout(
                        grProducer.getValue("sys_id")
                    );
                } catch {
                    throw new ErrorService.createError(
                        ErrorService.ERROR_TYPES.BAD_REQUEST,
                        gs.getMessage("Not able to check out copy of Record Producer")
                    );
                }
            }
        }

        static #getPublishedRecordProducerMetadata(sysId) {
            if (sysId) {
                const grRecordProducer = RecordProducerService.#getById(sysId);
                if (grRecordProducer) {
                    const {
                        first_name,
                        last_name
                    } = RecordProducerService.#getUserName(
                        grRecordProducer.getValue("sys_updated_by")
                    );
                    const sysUpdatedOn =
                        grRecordProducer.getDisplayValue("sys_updated_on");
                    return {
                        published_sys_updated_on: sysUpdatedOn,
                        published_sys_updated_by: `${first_name} ${last_name}`,
                    };
                }
            }
            return {
                published_sys_updated_on: "",
                published_sys_updated_by: "",
            };
        }

        static #getUserName(userId) {
            const grUser = new GlideRecordSecure("sys_user");
            grUser.addQuery("user_name", userId);
            grUser.query();
            if (grUser.next()) {
                return {
                    first_name: grUser.getValue("first_name") || "",
                    last_name: grUser.getValue("last_name") || "",
                };
            } else {
                return {
                    first_name: "",
                    last_name: "",
                };
            }
        }

        /**
         * Retrieves variables with their associated UI policies and other missing values.
         *
         * @param {String} sysId - sys_id of the record producer
         * @param {Array} variables - An array of variable objects to retrieve UI policies for. Each variable object must have an 'id' property.
         * @returns {Array} An array of variable objects with their associated UI policies added under the 'ui_policies' property.
         */
        static getVariablesWithExtendedFields(rpSysId, variables) {
            const variablesWithMissingValues =
                RecordProducerService.getMissingVariableValues(variables);
            const variablesWithUiPolicies =
                RecordProducerService.getUiPoliciesForVariables(
                    rpSysId,
                    variablesWithMissingValues
                );
            return variablesWithUiPolicies;
        }

        /**
         * Retrieves UI policies for variables.
         *
         * @param {String} rpSysId - sys_id of the record producer
         * @param {Array} variables - An array of variable objects to retrieve UI policies for. Each variable object must have an 'id' property.
         * @returns {Array} An array of variable objects with their associated UI policies added under the 'ui_policies' property.
         */
        static getUiPoliciesForVariables(rpSysId, variables) {
            const uiPolicies = CatalogUiPolicyService.getUiPoliciesForForm(rpSysId);
            const variableMap = this.#createVariableMap(variables);
            // Iterate through the keys of the variableMap, call CatalogUiPolicyService.getUiPoliciesForVariable for each key, and assign the result to the ui_policies property of the variable
            const variableSysIds = [...Object.keys(variableMap)];
            for (const sysId of variableSysIds) {
                if (uiPolicies[sysId] && uiPolicies[sysId].policies) {
                    variableMap[sysId].ui_policies = uiPolicies[sysId].policies;
                } else {
                    variableMap[sysId].ui_policies = [];
                }
            }

            return variables;
        }

        /**
         * Fetches and appends the read_only, hidden, and include_none values to each of the variables
         * @param {array} variables
         * @returns an array of variables with their read_only, hidden, and include_none values
         */
        static getMissingVariableValues(variables) {
            const variableMap = this.#createVariableMap(variables);
            const variableSysIds = [...Object.keys(variableMap)];

            RecordProducerService.#handleQuestionSets(variables);

            const varGr = new GlideRecordSecure("item_option_new");
            varGr.addQuery("sys_id", "IN", variableSysIds);
            varGr.query();
            while (varGr.next()) {
                const sysId = varGr.getValue("sys_id");
                let matchingVariable = variableMap[sysId];
                if (!matchingVariable) continue;
                matchingVariable.instructions = varGr.getValue("instructions");
                matchingVariable.hidden = varGr.getValue("hidden") === "1";
                matchingVariable.read_only = varGr.getValue("read_only") === "1";
                matchingVariable.include_none = varGr.getValue("include_none") === "1";
                matchingVariable.do_not_select_first =
                    varGr.getValue("do_not_select_first") === "1";
                matchingVariable.reference_qual = varGr.getValue("reference_qual");
                matchingVariable.validate_regex = varGr.getValue("validate_regex");
                matchingVariable.dynamic_value_dot_walk_path = varGr.getValue(
                    "dynamic_value_dot_walk_path"
                );
                matchingVariable.dynamic_value_field = {
                    value: varGr.getValue(
                        "dynamic_value_field"
                    ),
                    displayValue: varGr.getDisplayValue(
                        "dynamic_value_field"
                    )
                };
            }

            return variables;
        }

        /**
         * Creates a variable map from the given variables array.
         * This is not performant and is a temporary solution that will be addressed in the future.
         *
         * @param {Array} variables - The array of variables.
         * @returns {Object} - The variable map.
         */
        static #createVariableMap(variables) {
            const queue = [...variables];
            const variableMap = {};
            while (queue.length > 0) {
                const variable = queue.shift();

                if (
                    typeof variable.type === "string" &&
                    variable.type === "sc_multi_row"
                ) {
                    variable.type = 999;
                }

                variableMap[variable.id] = variable;
                if (Array.isArray(variable.children)) {
                    variable.children.forEach((child) => {
                        if (!variableMap[child.id]) {
                            variableMap[child.id] = child;
                            queue.push(child);
                        }
                    });
                }
            }
            return variableMap;
        }

        /**
         * Formats 2 column question sets for one_to_one types and for one_to_many it returns needed data to render display of one_to_many table
         * @param {array} variables
         * @returns an array of variables with QuestionSet containers setup for 2 column layouts and returns questions for one_to_many QuestionSets
         */
        static #handleQuestionSets(variables) {
            const multiQuestionSets = [];
            variables.forEach((item) => {
                if (
                    item.type === 0 &&
                    (item.layout ===
                        RecordProducerService.#QUESTION_SET_LAYOUTS.TWOCOLUMN_ALTERNATING ||
                        item.layout ===
                        RecordProducerService.#QUESTION_SET_LAYOUTS
                        .TWOCOLUMN_DOWNTHENOVER) &&
                    Array.isArray(item.children) &&
                    item.children.length > 0
                ) {
                    const orderFunction =
                        item.layout ===
                        RecordProducerService.#QUESTION_SET_LAYOUTS.TWOCOLUMN_ALTERNATING ?
                        RecordProducerService.#reorderEveryOther :
                        RecordProducerService.#reorderDownThenOver;
                    const {
                        left,
                        right
                    } = orderFunction(item);
                    item.children = [];
                    item.hasSplit = true;
                    item.containerSplitId = gs.generateGUID();
                    item.children.push(...left);
                    //Add container split
                    item.children.push({
                        active: true,
                        label: null,
                        type: 24,
                        mandatory: false,
                        friendly_type: "container_split",
                        display_type: "Container Split",
                        name: "formatter",
                        id: item.containerSplitId,
                        order: left[left.length - 1].order + 1,
                    });
                    item.children.push(...right);
                } else if (item.containerType === "one_to_many") {
                    multiQuestionSets.push(item.id);
                }
            });
            if (multiQuestionSets.length > 0) {
                const questionSetIds = [...multiQuestionSets];
                const grQuestions = new GlideRecordSecure("item_option_new");
                grQuestions.addQuery("variable_set", "IN", questionSetIds);
                grQuestions.orderBy("variable_set");
                grQuestions.orderBy("order");
                grQuestions.query();
                const variableMap = new Map(
                    variables.map((variable) => [variable.id, variable])
                );
                while (grQuestions.next()) {
                    const questionSetId = grQuestions.getValue("variable_set");
                    const questionSet = variableMap.get(questionSetId);
                    if (questionSet) {
                        let question = {
                            id: grQuestions.getValue("sys_id"),
                            active: grQuestions.getValue("active") === "1",
                            label: grQuestions.getValue("question_text"),
                            name: grQuestions.getValue("name"),
                            type: grQuestions.getValue("type"),
                            friendly_type: "sc_multi_type",
                        };
                        questionSet.children.push(question);
                    }
                }
            }
            return variables;
        }
        /**
         * Sorting strategy for '2across' 2 Column container Question Sets.  Splits questions by alternating between left and right.
         * @param {object} item
         * @returns two arrays (Left, Right) for questions between the containerSplit
         */
        static #reorderEveryOther(item) {
            if (item.children.length < 1) return;
            const left = [];
            const right = [];
            item.children.forEach((question, index) => {
                if (index % 2 === 0) {
                    left.push(question);
                } else right.push(question);
            });
            return {
                left,
                right,
            };
        }
        /**
         * Sorting strategy for '2down' for 2 Column container Question Sets.  Splits questions evenly between left and right with a bias toward left.
         * @param {object} item
         * @returns two arrays (Left, Right) for questions between the containerSplit
         */
        static #reorderDownThenOver(item) {
            if (item.children.length < 1) return;
            const left = [];
            const right = [];
            const leftCount = Math.ceil(item.children.length / 2);
            left.push(...item.children.splice(0, leftCount));
            right.push(...item.children);
            return {
                left,
                right,
            };
        }

        /**
         * Get Record Producer specified by the sysId
         *
         * @param sysId - the sysId of the record producer
         * @returns a GlideRecord of the Record Producer
         */
        static #getById(sysId) {
            const grProducer = new GlideRecordSecure(
                RecordProducerService.#TABLE_NAME
            );
            const found = grProducer.get(sysId);
            if (!found) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage(
                        "Record does not exist or user does not have access to read it. table: {0}, sys_id: {1}",
                        [RecordProducerService.#TABLE_NAME, sysId]
                    ), {
                        sysId,
                        tableName: RecordProducerService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            return grProducer;
        }

        /**
         * Get Record Producers in a request app
         *
         * @param requestAppId - the sysId of the
         * @returns a GlideRecord list of Record Producers
         */
        static getAllByRequestAppId(requestAppId, queryString) {
            const result = [];
            const encodedQuery =
                queryString === null || queryString === undefined ?
                "checked_out=false^ORchecked_out=" :
                queryString;
            const requestApp = RequestAppService.getById(requestAppId);
            const grProducer = new GlideRecordSecure(
                RecordProducerService.#TABLE_NAME
            );
            grProducer.addQuery("sys_scope", requestApp.scopeId);
            grProducer.addQuery("table_name", requestApp.requestTable);
            grProducer.addEncodedQuery(encodedQuery, true);
            grProducer.orderBy("name");

            grProducer.query();

            while (grProducer.next()) {
                const pictureId = grProducer.getValue("picture");
                const formImageUrl = pictureId ? `${pictureId}.iix?t=small` : '';
                result.push({
                    sysId: grProducer.getValue("sys_id"),
                    name: grProducer.getDisplayValue("name"),
                    scopeId: grProducer.getValue("sys_scope"),
                    state: grProducer.getDisplayValue("state"),
                    stateValue: grProducer.getValue("state"),
                    active: Boolean(grProducer.active), //Boolean elements resolve to true/false, but the value is '1'/'0'
                    isCheckedOut: grProducer.getValue("checked_out"),
                    requestTable: grProducer.getValue("table_name"),
                    formImageUrl: formImageUrl,
                    publishedRef: grProducer.getValue("published_ref")
                });
            }
            return result;
        }

        /**
         * Determines if the Record Producer's table_name is the same as the application's Table Name
         * 
         * @param {object} grRecordProducer - Gliderecord pointing to the record producer
         */

        static #checkRecordProducerTableMatchesAppTable(grRecordProducer) {
            const scope = grRecordProducer.getValue("sys_scope");
            const tableName = grRecordProducer.getValue("table_name");

            const rac = new GlideRecordSecure("sn_creatorstudio_request_app_config");
            rac.addQuery("sys_scope", scope);
            rac.query();

            if (rac.next() && rac.getValue("request_table") !== tableName) {
                const error = ErrorService.createError(
                    RecordProducerService.#REQUEST_FORM_TABLE_MISMATCH,
                    gs.getMessage("Record Producer Table doesn't match Application Table")
                )
                throw error;
            }
        }

        /**
         * Get the  Record Producer associated with the sysId specified by query
         *
         * @param {string} sysId - the sysId of the Record Producer
         * @returns {object} a mapping of record producer attribute values and variables
         */
        static getRecordProducer(sysId, requireTableMatch = false) {
            if (!sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Parameter 'sysId' was not specified")
                );
                throw error;
            }
            return RecordProducerService.#getCatItemSummary(sysId, requireTableMatch);
        }

        /**
         * Get the draft record producer of a given sysId
         *
         * @param {string} sysId - the sysId of the Record Producer
         * @returns {object} a mapping of record producer attribute values and variables
         */
        static checkoutRecordProducer(sysId) {
            if (!sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Parameter 'sysId' was not specified")
                );
                throw error;
            }

            const grProducer = RecordProducerService.#getById(sysId);
            switch (grProducer.getValue("state")) {
                case RecordProducerService.#STATES.DRAFT:
                    break;
                case RecordProducerService.#STATES.PUBLISHED:
                    sysId = RecordProducerService.#findDraftRecordProducerId(grProducer);
                    break;
                default:
                    throw new ErrorService.createError(
                        ErrorService.ERROR_TYPES.BAD_REQUEST,
                        gs.getMessage("Unable to checkout Record Producer")
                    );
                    throw error;
            }

            return {
                sysId: sysId,
            };
        }

        /**
         * Updates the details of the record producer specified by sysId.
         *
         * @param {string} sysId - the sys_id of the record producer record to update
         * @param {object} details - the column values to update on the record producer record. May include:
         * name, shortDescription, description, and picture.
         * @returns {object} a mapping of record producer attribute values and variables
         */
        static updateRecordProducer(sysId, details = {}) {
            if (!sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Parameter 'sysId' was not specified")
                );
                throw error;
            }

            if (Object.keys(details).length < 1) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("No fields specified for update!")
                );
                throw error;
            }

            const grRecordProducer = RecordProducerService.#getById(sysId);
            if (!grRecordProducer.canWrite()) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage(
                        "Insufficient permissions to update a record in table: {0}, sysId: {1}",
                        [RecordProducerService.#TABLE_NAME, sysId]
                    ), {
                        tableName: RecordProducerService.#TABLE_NAME,
                        sysId,
                    }
                );
            }

            const columnValues = {};

            if (details.createDefaultQuestions !== undefined) {
                const defaultQuestions = QuestionService.createDefaultQuestions(sysId);
            }

            if (details.name !== undefined) {
                columnValues.name = details.name;
            }
            if (details.shortDescription !== undefined) {
                columnValues.short_description = details.shortDescription;
            }
            if (details.description !== undefined) {
                columnValues.description = details.description;
            }
            if (details.picture !== undefined) {
                if (details.picture === "") {
                    RecordProducerService.#deletePicture(grRecordProducer);
                } else {
                    RecordProducerService.#checkPictureAssignableToRecordProducer(
                        details.picture,
                        grRecordProducer
                    );
                }
                columnValues.picture = details.picture;
            }
            if (details.attachmentMandatory !== undefined) {
                columnValues.mandatory_attachment =
                    details.attachmentMandatory === "true" ? true : false;
            }
            if (details.hideAttachment !== undefined) {
                columnValues.no_attachment_v2 =
                    details.hideAttachment === "true" ? "1" : "0";
            }

            try {
                const catItem = new sn_sc.CatItem(sysId);
                catItem.update(columnValues, true);
            } catch (e) {
                throw new ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR,
                    e.message ?
                    e.message :
                    gs.getMessage("Failed to update Record Producer!  sys_id: {0}", [
                        recordProducerId,
                    ])
                );
            }

            return RecordProducerService.#getCatItemSummary(sysId, false);
        }

        /**
         * Create a Record Producer with attributes specified in payload
         *
         * @param payload - object with column names as keys and their values
         * @returns a sysId of the created Record Producer
         */
        static createProducer(payload = {}) {
            const grProducer = new GlideRecord(RecordProducerService.#TABLE_NAME);
            if (!grProducer.canCreate()) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage(
                        "Insufficient permissions to create a record in {0} table",
                        RecordProducerService.#TABLE_NAME
                    ), {
                        tableName: RecordProducerService.#TABLE_NAME,
                    }
                );
            }

            try {
                const catalogItem = new sn_sc.CatItem();
                const attributes = {
                    ...RecordProducerService.#getDefaultAttributes(),
                    ...payload,
                };

                catalogItem.setAttributes(attributes);
                catalogItem.setTableName(RecordProducerService.#TABLE_NAME);

                return catalogItem.create(true);
            } catch (e) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage(
                        "Failed to create a record in {0} table",
                        RecordProducerService.#TABLE_NAME
                    ), {
                        tableName: RecordProducerService.#TABLE_NAME,
                    }
                );
            }
        }

        /**
         * Publishes the Record Producer specified by the sysId
         * The record producer state must be in "draft"
         * @param sysId - sys_id of "draft" record producer to publish
         * @returns string - The sysId of the published record producer
         */
        static publishRecordProducer(sysId, options = {}) {
            const grRecordProducer = new GlideRecordSecure(
                RecordProducerService.#TABLE_NAME
            );
            if (!grRecordProducer.get(sysId) || !grRecordProducer.canWrite()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage(
                        "Record does not exist or user does not have access to publish it. table: {0}, sys_id: {1}",
                        [RecordProducerService.#TABLE_NAME, sysId]
                    ), {
                        sysId,
                        tableName: RecordProducerService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            // Only publish record producer if in "draft" state
            if (
                grRecordProducer.getValue("state") !==
                RecordProducerService.#STATES.DRAFT
            ) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.ILLEGAL_STATE,
                    gs.getMessage("Failed to publish record producer!")
                );
                throw error;
            }

            try {
                // Update record producer state to "publishing".
                const columnValues = {
                    state: RecordProducerService.#STATES.PUBLISHING,
                };
                var catItem = new sn_sc.CatItem(sysId);
                catItem.update(columnValues, false);
                // publish record producer

                const active =
                    typeof options.active === "boolean" ?
                    options.active.toString() :
                    true.toString();
                sn_sc.CatalogItemVersioningService.publish(sysId, active, "");
                const publishedRef =
                    grRecordProducer.getValue("published_ref") || sysId;
                return {
                    sysId: publishedRef,
                };
            } catch (err) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR,
                    gs.getMessage("Failed to publish Record Producer!")
                );
                throw error;
            }
        }

        /**
         * Cancel checkout for a given record producer and reverts all un-published changes to previous publish point
         *
         * @param sysId - String for recordProducer to revert
         * @returns boolean if checkout was successful or false if unable or state incorrect not supporting a cancel checkout
         */
        static cancelCheckout(sysId) {
            if (!sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Parameter 'sysId' was not specified")
                );
                throw error;
            }

            let success = false;
            try {
                success =
                    new global.ServiceCatalogVersioningUtils().cancelCheckout(sysId) ===
                    "true";
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR,
                    gs.getMessage(
                        "Failed to complete cancel checkout for record producer: {0} ",
                        e.message
                    )
                );
                throw error;
            }

            return {
                success,
            };
        }

        /**
         * Retrieves all topics. Topics can be filtered by taxonomy and/or a searchTerm
         *
         * @param taxonomy - Taxonomy of the topic to query by
         * @param parentTopic - Topic sysId to query and check child topics
         * @param offset - start of rows of records to return in window
         * @param pageSize - amount of records to return in window
         * @param searchTerm - string to run a contains on topic name
         * @returns a list of topics
         */
        static getTopics(
            taxonomy,
            parentTopic,
            offset = 0,
            pageSize = 50,
            searchTerm = "",
            topLevel = false
        ) {
            const topics = [];
            const gr = new GlideRecordSecure("topic");
            gr.chooseWindow(offset, pageSize + offset);
            gr.orderBy("sys_name");

            if (topLevel) {
                gr.addQuery("parent_topic", null);
                gr.addQuery("taxonomy", taxonomy);
            } else {
                if (taxonomy) {
                    gr.addQuery("taxonomy", taxonomy);
                }

                if (searchTerm) {
                    gr.addQuery("sys_name", "CONTAINS", searchTerm);
                }

                if (parentTopic) {
                    gr.addQuery("parent_topic", parentTopic);
                }
            }

            gr.query();

            while (gr.next()) {
                const childTopicGr = new GlideRecordSecure("topic");
                childTopicGr.addQuery("parent_topic", gr.getUniqueValue());
                childTopicGr.setLimit(1);
                childTopicGr.query();

                topics.push({
                    name: gr.getDisplayValue("name"),
                    parentTopic: gr.getValue("parent_topic"),
                    topicPath: gr.getValue("topic_path"),
                    sysId: gr.getUniqueValue(),
                    taxonomy: gr.getValue("taxonomy"),
                    hasChildren: childTopicGr.next(),
                });
            }

            return {
                topics,
                offset,
                pageSize,
            };
        }

        /**
         * Retrieves all templates that are part of the record producer builder
         * composite record producer and have editable destination tables
         *
         * @param offset - start of rows of records to return in window
         * @param pageSize - amount of records to return in window
         * @param searchTerm - string to run a contains on topic name
         * @returns a list of sc_templates
         */
        static getRecordProducerTemplates(
            pageSize = 50,
            offset = 0,
            searchTerm = ""
        ) {
            const templates = [];
            const templateIds = [];
            const templateDetailGr = new GlideRecordSecure("sc_template_detail");
            const templateDenyList = gs.getProperty("com.glide.creator_studio.template_deny_list");
            templateDetailGr.orderBy("sys_name");
            // Only include the record submission table variable and record producer templates
            templateDetailGr.addQuery(
                "template.cat_item",
                this.RECORD_PRODUCER_BUILDER_SYS_ID
            );
            templateDetailGr.addQuery(
                "item_option_new",
                this.RECORD_SUBMISSION_VARIABLE_SYS_ID
            );
            templateDetailGr.addQuery("readonly", false);
            if (searchTerm) {
                templateDetailGr.addQuery("template.name", "CONTAINS", searchTerm);
            }
            templateDetailGr.orderBy("template.name");
            templateDetailGr.query();
            while (templateDetailGr.next()) {
                const templateId = templateDetailGr.getValue("template")
                if (!templateDenyList || !templateDenyList.match(templateId))
                    templateIds.push(templateId);
            }
            const templateGr = new GlideRecordSecure("sc_template");
            templateGr.addQuery('sys_id', 'IN', templateIds);
            templateGr.addActiveQuery();
            templateGr.chooseWindow(offset, pageSize + offset);
            templateGr.orderBy('name');
            templateGr.query();
            while (templateGr.next()) {
                templates.push({
                    name: templateGr.getDisplayValue("name"),
                    sysId: templateGr.getValue("sys_id"),
                    catItem: templateGr.getValue("cat_item"),
                    shortDescription: templateGr.getDisplayValue("short_description"),
                    useTemplateScope: Boolean(templateGr.use_template_scope),
                    availableFor: templateGr.getDisplayValue("available_for"),
                });
            }
            return {
                templates,
                _rowCount: templateGr.getRowCount(),
            };
        }

        /**
         * Runs the create_text2catalog sn_ae_gen_ai.task generate_function
         *
         * @param payload - AiPayload from RequestForm Schema
         * @returns sysId of created catalog item or error
         */
        static generateAndPersistRequestForm(payload) {
            const error = ErrorService.createError(
                ErrorService.ERROR_TYPES.UNKNOWN_ERROR,
                gs.getMessage("Failed to generate Record Producer!")
            );
            let output = {};
            try {
                output = sn_ae_gen_ai.TaskService.generate('create_text2catalog', payload);

                if (!output.success)
                    throw error;

                // In case AI overwrites the table name, ensure it's correct for the request form
                const outputGR = new GlideRecord('sc_cat_item_producer');
                outputGR.get(output.cat_item_id);

                if (outputGR.isValidRecord()) {
                    const tableName = outputGR.getValue('table_name');
                    const payloadTable = payload.variables.find(variable => {
                        return variable.name === 'ZZ_YYtable_name_9faf5bdcc7321010159ca1e603c26023'
                    });
                    const payloadTableValue = payloadTable?.value;
                    if (payloadTableValue !== tableName) {
                        const catItem = new sn_sc.CatItem(output.cat_item_id);
                        catItem.update({
                            table_name: payloadTableValue
                        }, true);
                    }
                }

                return output;
            } catch (e) {
                gs.debug(e);
                throw error;
            }
        }

        static deleteCatalogUIPolicies(payload) {
			const sysIds = payload?.sysIds;
            try {
                if (!sysIds || sysIds.length === 0) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.UNKNOWN,
                        gs.getMessage("No sys id specified for catalog ui policy") + ": " + e.message
                    );
                }

                let catalogUIPolicy = new GlideRecordSecure("catalog_ui_policy");
                catalogUIPolicy.addQuery("sys_id", "IN", sysIds);
                catalogUIPolicy.query();

                while (catalogUIPolicy.next()) {
                    const csDataProxy = new global.CreatorStudioDataProxy();
                    csDataProxy.deleteRecord(catalogUIPolicy);
                }

				return {
					success: true
				}
            } catch (e) {
                gs.debug(e);
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNKNOWN,
                    gs.getMessage("Failed to delete catalog ui policy") + ": " + e.message
                );
            }
        }
    };
})();
