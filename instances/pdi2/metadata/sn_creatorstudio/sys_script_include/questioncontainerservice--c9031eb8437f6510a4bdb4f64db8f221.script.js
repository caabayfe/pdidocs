const QuestionContainerService = (function() {
    return class QuestionContainerService {
        static type = "QuestionContainerService";
        static #TABLE_NAME = "item_option_new";
        static #QUESTION_SET_TABLE_NAME = "io_set_item"

        static transformBooleanField(value) {
            return typeof value === "boolean" ? value.toString() : value;
        }

        /**
         * Create an item_option_new record with attributes specified in payload
         *
         * @param payload - object with column names as keys and their values
         * @returns a Variable object of the created question
         */
        static saveContainer(payload = {}) {
            if (!payload.catItem && !payload.sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("No catItem or sysId specified for container!")
                );
                throw error;
            }

            if (payload.catItem && payload.sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Both catItem and sysId specified for container!")
                );
                throw error;
            }

            if (payload.catItem && !payload.type) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Cannot create container if type is not specified!")
                );
                throw error;
            }

            const grQuestion = new GlideRecordSecure(
                QuestionContainerService.#TABLE_NAME
            );
            if (payload.catItem && !grQuestion.canCreate()) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage(
                        "Insufficient permissions to create a record in {0} table",
                        QuestionContainerService.#TABLE_NAME
                    )
                );
            } else if (payload.sysId) {
                // get record that we are updating and check if we can write
                if (!grQuestion.get(payload.sysId) || !grQuestion.canWrite()) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.UNAUTHORIZED,
                        gs.getMessage(
                            "Insufficient permissions to write to record in {0} table",
                            QuestionContainerService.#TABLE_NAME
                        )
                    );
                }
            }

            // Build output
            let responseObject = {};

            // Build request with underscore values sans choices
            const transformedPayload = {
                cat_item: payload.catItem,
                question_text: payload.sectionText,
                display_type: payload.displayType,
                active: QuestionContainerService.transformBooleanField(payload.active),
                display_title: QuestionContainerService.transformBooleanField(
                    payload.displayTitle
                ),
                sys_id: payload.sysId,
                type: payload.type,
                id: payload.id,
                name: QuestionNameUtils.makeName({
                    ...payload,
                    questionText: payload.sectionText
                }),
                order: payload.order,
                layout: payload.layout,
                attributes: payload.attributes,
                columnCount: payload.columnCount,
            };

            try {
                responseObject = payload.catItem ?
                    sn_sc.QuestionDesigner.createResource(
                        "container",
                        transformedPayload
                    ) :
                    sn_sc.QuestionDesigner.updateResource(
                        payload.sysId,
                        "container",
                        transformedPayload
                    );
            } catch (e) {
                gs.debug(e);
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error creating the question container")
                );
                throw error;
            }

            // Sometimes request is successful but contains errors in response body
            if (responseObject.errCode) {
                gs.debug(responseObject);
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error inserting the question container")
                );
                throw error;
            }
            return responseObject;
        }

        /**
         * Deletes `item_option_new` and `io_set_item` records using attributes specified in the payload.
         *
         * @param {Object} payload - An object containing the catalog item sys_id, along with the sys_ids of questions and question sets to delete.
         * @returns {Object} A variable object indicating the status of the deletion.
         */

        static deleteContainer(payload = {}) {
            const {
                sysIds,
                catItem
            } = payload;

            // Input validation
            if (!sysIds) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("No sysIds specified for container!")
                );
            }

            if (!catItem) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("No catItem specified for container!")
                );
            }

            const sysIdsArr = sysIds.split(',');
            let deleteError = false;

            try {
                // Delete individual questions
                const questionIDs = QuestionContainerService.#getQuestions(catItem, sysIdsArr);
                deleteError = deleteError || this.#deleteResources("question", questionIDs, {
                    cat_item: catItem
                });

                // Delete question sets
                const questionSetIDs = QuestionContainerService.#getQuestionSets(catItem, sysIdsArr);
                deleteError = deleteError || this.#deleteResources("question_set", questionSetIDs, {
                    sc_cat_item: catItem
                });

                if (deleteError) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.RECORD_DELETION_FAILED,
                        gs.getMessage("Error deleting the question container")
                    );
                }

                return {
                    success: !deleteError
                };

            } catch (e) {
                gs.debug(e);
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_DELETION_FAILED,
                    gs.getMessage("Container failed to delete.")
                );
            }
        }

        /**
         * Deletes questions or question sets from a catalog item.
         *
         * @param {String} resourceType - Type of resource to delete ("question" or "question_set"). Defaults to "question".
         * @param {Array<String>} ids - Array of sys_ids of questions or question sets.
         * @param {Object} additionalPayload - Contains additional attributes such as the catalog item sys_id.
         * @returns {Boolean} True if any deletion errors were encountered, otherwise false.
         */
        static #deleteResources(resourceType = "question", ids = [], additionalPayload = {}) {
            let encounteredError = false;

            ids.forEach(id => {
                try {
                    const payload = {
                        ...additionalPayload
                    };

                    if (resourceType === "question") {
                        payload.sys_id = id;
                    } else if (resourceType === "question_set") {
                        payload.variable_set = id;
                    }

                    const response = sn_sc.QuestionDesigner.deleteResource(resourceType, payload);
                    if (response.errorCode) {
                        encounteredError = true;
                    }

                } catch (e) {
                    gs.debug(e);
                    encounteredError = true;
                }
            });

            return encounteredError;
        }
        /**
         * Retrieves sys_ids of `item_option_new` records.
         *
         * @param {String} catItem - The sys_id of the catalog item.
         * @param {Array<String>} sysIds - Array of sys_ids for both questions and question sets.
         * @returns {Array<String>} An array of sys_ids for `item_option_new` records.
         */

        static #getQuestions(catItem, sysIds) {
            const questionIDs = [];
            const question = new GlideRecordSecure(QuestionContainerService.#TABLE_NAME);
            question.addQuery("sys_id", "IN", sysIds);
            question.addQuery("cat_item", catItem);
            question.query();
            while (question.next()) {
                questionIDs.push(
                    question.getValue("sys_id")
                )
            }

            return questionIDs;
        }

        /**
         * Retrieves sys_ids of `io_set_item` records.
         *
         * @param {String} catItem - The sys_id of the catalog item.
         * @param {Array<String>} sysIds - Array of sys_ids for both questions and question sets.
         * @returns {Array<String>} An array of sys_ids for `io_set_item` records.
         */
        static #getQuestionSets(catItem, sysIds) {
            const questionSetsIDs = [];
            const questionSet = new GlideRecordSecure(QuestionContainerService.#QUESTION_SET_TABLE_NAME);
            questionSet.addQuery("variable_set", "IN", sysIds);
            questionSet.addQuery("sc_cat_item", catItem);
            questionSet.query();
            while (questionSet.next()) {
                questionSetsIDs.push(questionSet.getValue("variable_set"))
            }
            return questionSetsIDs;
        }
    };
})();
