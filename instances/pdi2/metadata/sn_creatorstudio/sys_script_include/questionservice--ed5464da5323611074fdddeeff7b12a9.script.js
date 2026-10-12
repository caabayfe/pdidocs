const QuestionService = (function() {
    return class QuestionService {
        static type = "QuestionService";
        static #TABLE_NAME = "item_option_new";
        static #CHECKBOX_CONTAINER_DEFAULT_LABEL = "Options";

        static QUESTION_TYPES = {
            VIRTUAL_CONTAINER: {
                id: "0",
                name: "container_start",
            },
            CHECKBOX_CONTAINER: {
                id: "0",
                name: "checkbox_container",
            },
            YES_NO: {
                id: "1",
                name: "yes_no",
            },
            MULTI_LINE_TEXT: {
                id: "2",
                name: "multi_line_text",
            },
            MULTIPLE_CHOICE: {
                id: "3",
                name: "multiple_choice",
            },
            NUMERIC_SCALE: {
                id: "4",
                name: "numeric_scale",
            },
            SELECT_BOX: {
                id: "5",
                name: "select_box",
            },
            SINGLE_LINE_TEXT: {
                id: "6",
                name: "single_line_text",
            },
            CHECKBOX: {
                id: "7",
                name: "check_box",
            },
            REFERENCE: {
                id: "8",
                name: "reference",
            },
            DATE: {
                id: "9",
                name: "date",
            },
            HEADER: {
                id: "11",
                name: "header",
            },
            BREAK: {
                id: "12",
                name: "break",
            },
            FIELD_CHOICE: {
                id: "18",
                name: "field_choice",
            },
            CONTAINER_START: {
                id: "19",
                name: "container_start",
            },
            CONTAINER_END: {
                id: "20",
                name: "container_end",
            },
            MULTI_SELECT: {
                id: "21",
                name: "list_collector",
            },
            RICH_TEXT: {
                id: "32",
                name: "rich_text",
            },
        };

        static #QUESTION_SET_TYPES = {
            ONE_TO_ONE: 'one_to_one',
            ONE_TO_MANY: 'one_to_many'
        }

        static #isQuestionSet(question) {
            return (
                question.containerType === QuestionService.#QUESTION_SET_TYPES.ONE_TO_ONE ||
                question.containerType === QuestionService.#QUESTION_SET_TYPES.ONE_TO_MANY
            );
        }

        static transformBooleanField(value) {
            return typeof value === "boolean" ? value.toString() : value;
        }

        /**
         * Create or Update an item_option_new record with attributes specified in payload
         *
         * @param payload - object with column names as keys and their values
         * @returns a Question object of the created or updated question
         */
        static saveQuestion(payload = {}, isDefaultQuestion = false) {
            if (!payload.catItem && !payload.sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("No catItem or sysId specified for question!")
                );
                throw error;
            }

            if (payload.catItem && payload.sysId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Both catItem and sysId specified for question!")
                );
                throw error;
            }

            if (payload.catItem && !payload.type) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Cannot create question if type is not specified!")
                );
                throw error;
            }

            const grQuestion = new GlideRecordSecure(QuestionService.#TABLE_NAME);
            if (payload.catItem && !grQuestion.canCreate()) {
                throw ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage(
                        "Insufficient permissions to create a record in {0} table",
                        QuestionService.#TABLE_NAME
                    )
                );
            } else if (payload.sysId) {
                // get record that we are updating and check if we can write
                if (!grQuestion.get(payload.sysId) || !grQuestion.canWrite()) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.UNAUTHORIZED,
                        gs.getMessage(
                            "Insufficient permissions to write to record in {0} table",
                            QuestionService.#TABLE_NAME
                        )
                    );
                }
            }

            // turn camelCase keys to snake_case and booleans to strings
            const transformedPayload = {
                type: payload.type,
                cat_item: payload.catItem,
                sys_id: payload.sysId,
                question_text: payload.questionText,
                help_text: payload.helpText === "" ? "NULL" : payload.helpText,
                instructions: payload.instructions === "" ? "NULL" : payload.instructions,
                show_help: payload.instructions === "" ? "false" : "true",
                display_type: payload.displayType,
                map_to_field: QuestionService.transformBooleanField(payload.mapToField),
                display_title: QuestionService.transformBooleanField(
                    payload.display_title
                ),
                id: payload.id,
                active: QuestionService.transformBooleanField(payload.active),
                name: isDefaultQuestion ? payload.name : QuestionNameUtils.makeName(payload),
                order: payload.order,
                layout: payload.layout,
                attributes: payload.attributes,
                mandatory: QuestionService.transformBooleanField(payload.mandatory),
                field: payload.field,
                hidden: QuestionService.transformBooleanField(payload.hidden),
                read_only: QuestionService.transformBooleanField(payload.readOnly),
                default_value: payload.defaultValue === "" ? "NULL" : payload.defaultValue,
                include_none: QuestionService.transformBooleanField(
                    payload.includeNone
                ),
                do_not_select_first: QuestionService.transformBooleanField(
                    payload.doNotSelectFirst
                ),
                reference: payload.reference,
                reference_qual: payload.referenceQual === "" ? "NULL" : payload.referenceQual,
                list_table: payload.listTable,
                lookup_value: payload.lookupValue,
                lookup_label: payload.lookupLabel,
                lookup_table: payload.lookupTable,
                rich_text: payload.richText,
                validate_regex: payload.validateRegex === "" ? "NULL" : payload.validateRegex,
                dynamic_value_dot_walk_path: payload.dynamicValueDotWalkPath === "" ? "NULL" : payload.dynamicValueDotWalkPath,
                dynamic_value_field: payload.dynamicValueField === "" ? "NULL" : payload.dynamicValueField,
            };

            // Build output
            let responseObject = {};

            let returnObject = {};
            
            try {
                responseObject = payload.catItem ?
                    sn_sc.QuestionDesigner.createResource(
                        "question",
                        transformedPayload
                    ) :
                    sn_sc.QuestionDesigner.updateResource(
                        payload.sysId,
                        "question",
                        transformedPayload
                    );

                returnObject = {
                    ...responseObject,
                };
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error saving the question")
                );
                throw error;
            }

            // Sometimes request is successful but contains errors in response body
            if (responseObject.errCode) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error saving the question")
                );
                throw error;
            }

            let outputChoices = [];

            const choiceSaveErrorMsg = payload.choices ?
                `${gs.getMessage(
            "Error saving the question choices for record: {0}"
          )} ${responseObject.sys_id}` :
                `${gs.getMessage(
            "Error getting the question choices for record: {0}"
          )} ${responseObject.sys_id}`;

            const requestFormUtils = new global.RequestFormUtils();
            try {
                // if payload has choices and catItem, create choices
                // if payload has choices and sysId, replace choices
                // if payload has sysId and no choices, get existing choices for question
                outputChoices =
                    payload.choices && payload.catItem ?
                    requestFormUtils.createChoicesForQuestion(responseObject.sys_id, [
                        ...payload.choices,
                    ]) :
                    payload.choices && payload.sysId ?
                    requestFormUtils.replaceChoicesForQuestion(
                        responseObject.sys_id,
                        [...payload.choices]
                    ) :
                    payload.sysId ?
                    requestFormUtils.getChoicesForQuestion(responseObject.sys_id) : [];

                if (!Array.isArray(outputChoices)) {
                    const error = ErrorService.createError(
                        ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                        choiceSaveErrorMsg
                    );
                    throw error;
                }
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    choiceSaveErrorMsg
                );
                throw error;
            }
            returnObject.choices = outputChoices;

            // Set these as their passed in values because they are not included in the response from QuestionDesigner
            // In the case that there is an error from QuestionDesigner, an error would already have been thrown
            returnObject.hidden = QuestionService.transformBooleanField(
                payload.hidden
            );
            returnObject.readOnly = QuestionService.transformBooleanField(
                payload.readOnly
            );
            returnObject.doNotSelectFirst = QuestionService.transformBooleanField(
                payload.doNotSelectFirst
            );
            returnObject.referenceQual = payload.referenceQual;

            return returnObject;
        }

        /**
         * Create default questions. Used by ServiceService.create()
         *
         * @param {String} sysId of catalog item record
         */
        static createDefaultQuestions(catalogItemSysId, questionCount = 3) {
            // catalogItemSysId is validated in QuestionService.createQuestion()
            const sharedProperties = {
                catItem: catalogItemSysId,
                type: QuestionService.QUESTION_TYPES.SINGLE_LINE_TEXT.id,
                active: "true",
            };

            for (let i = 1; i <= questionCount; i++) {
                const number = i.toString();
                QuestionService.saveQuestion({
                    questionText: gs.getMessage("Question {0}", number),
                    name: `question_${number}`,
                    order: (i * 100).toString(),
                    ...sharedProperties,
                }, true);
            }
        }

        /* Reorders a list of questions for a given RecordProducer
         *
         * @param payload - object with recordProducerId and an Array of Questions in desired order
         * @returns an Array of Variable objects associated to the RecordProducer
         */
        static reorderQuestions(payload = {}) {
            const {
                recordProducerId,
                questions
            } = payload;
            //Validate Required Properties of Payload Object
            if (!recordProducerId) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("RecordProducerId is required")
                );
                throw error;
            }
            if (!questions?.length > 0) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage(
                        "No questions provided to reorder, questions are required"
                    )
                );
                throw error;
            }
            const questionTableGR = new GlideRecord(QuestionService.#TABLE_NAME);
            if (!questionTableGR.canWrite()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("User does not have permission to update questions")
                );
                throw error;
            }
            try {
                //Call catalog reorder function
                const flattenedQuestions = QuestionService.#flattenQuestions(questions);

                // DEF0461310: Ensure all variables have an order.
                let order = 100;
                flattenedQuestions.forEach((question) => {
                    question.order = order;
                    order = order + 100;
                });

                const serializedQuestionPayload = JSON.stringify({
                    serializedData: flattenedQuestions,
                });
                new sn_sc.QuestionDesigner.updateQuestionOrders(
                    serializedQuestionPayload,
                    recordProducerId
                );
                //return reordered questions
                const catItem = new sn_sc.CatItem(recordProducerId);
                const variables = catItem.getVariables(false, false, false);
                const variablesWithExtendedFields = RecordProducerService.getVariablesWithExtendedFields(
                    recordProducerId,
                    variables
                );
                return variablesWithExtendedFields;
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error updating question sort order")
                );
                throw error;
            }
        }

        /* Takes a question and checks if it is a checkbox container with a header
         *
         * @param question - Question Object
         * @returns a boolean
         */

        static #isCheckboxContainerWithHeader(question) {

            return (question.type === Number(QuestionService.QUESTION_TYPES.CHECKBOX_CONTAINER.id) && question.label !== QuestionService.#CHECKBOX_CONTAINER_DEFAULT_LABEL)

        }

        /* Takes a list of questions with nested questions (such as containers) and builds a flat list used by the reorder questions function
         *
         * @param questions - Array of questions (Variables) in order of which they should be reordered
         * @returns an Array of flattened questions
         */
        static #flattenQuestions(questions) {
            if (!Array.isArray(questions) || questions.length === 0) return [];
            let flatQuestions = [];
            questions.forEach((question) => {
                // No need to include the virtual containers
                // Virtual Containers and Question Sets share an ID unfortunately, need additional check for Question Sets
                if (
                    QuestionService.#isQuestionSet(question) ||
                    question.type !== Number(QuestionService.QUESTION_TYPES.VIRTUAL_CONTAINER.id)
                ) {
                    flatQuestions.push(QuestionService.#questionPayloadMapper(question));
                }

                // Check for checkbox container with header
                if (
                    !QuestionService.#isQuestionSet(question) &&
                    QuestionService.#isCheckboxContainerWithHeader(question) &&
                    Array.isArray(question.children)
                ) {
                    flatQuestions.push(
                        QuestionService.#questionPayloadMapper(question, true)
                    );
                }

                if (!QuestionService.#isQuestionSet(question) && Array.isArray(question.children)) {
                    const flatChildren = QuestionService.#flattenQuestions(
                        question.children
                    );
                    flatQuestions.push(...flatChildren);
                }

                if (
                    question.type ===
                    Number(QuestionService.QUESTION_TYPES.CONTAINER_START.id)
                ) {
                    flatQuestions.push(
                        QuestionService.#questionPayloadMapper({
                            id: question.containerEndId,
                            name: null,
                            type: Number(QuestionService.QUESTION_TYPES.CONTAINER_END.id),
                            friendlyType: QuestionService.QUESTION_TYPES.CONTAINER_END.name,
                            containerType: null,
                        })
                    );
                }
            });

            return flatQuestions;
        }

        /* Simple mapper function to return only the values and names needed by the reordering function
         *
         * @param question - Question Object
         * @returns an New Question object used for reorder function
         */
        static #questionPayloadMapper(question, isCheckboxWithHeader = false) {
            const {
                id,
                name,
                friendlyType,
                containerType,
                order,
                active,
                type
            } =
            question;

            const payload = {
                id,
                name: name ? `variables.${name}` : null,
                friendly_type: friendlyType,
                containerType,
                order,
                active,
                type,
            };

            //Mapping for checkbox with header
            if (isCheckboxWithHeader) {
                payload.type = Number(QuestionService.QUESTION_TYPES.CHECKBOX_CONTAINER.id);
                payload.active = true;
            }

            return payload;
        }
    };
})();
