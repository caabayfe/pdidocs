const QuestionSetService = (function() {
    return class QuestionSetService {
        static type = "QuestionSetService";

		/**
		 * @param payload - object with column names as keys and their values
		 * @returns a Variable object of the created question
		 * 
		 * Attempts to delete current variableSet and replace it with updatedVariableSet
		 */
        static updateVariableSet(payload) {
            try {
                sn_sc.QuestionDesigner.deleteResource(
                    'question_set', {
                        sc_cat_item: payload.catItem,
                        variable_set: payload.variableSet
                    }
                );
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Error removing original variableSet before updating.")
                );
                throw error;
            }

            let responseObject;
            try {
                responseObject = sn_sc.QuestionDesigner.createResource(
                    'question_set', {
                        sc_cat_item: payload.catItem,
                        variable_set: payload.updatedVariableSet,
                        order: payload.order
                    }
                );
            } catch (e) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Error updating question set, please try again.")
                );
                throw error;
            }

            return responseObject;
        }

        /**
         * Create an io_set_item record with attributes specified in payload via sn_sc.QuestionDesigner
         *
         * @param payload - object with column names as keys and their values
         * @returns a Variable object of the created question
         */
        static saveQuestionSet(payload = {}) {

            // Build output
            let responseObject = {};

			// Build request with underscore values sans choices
			// catItem and variableSet are required in the schema, if they are not passed,
			// we shouldn't get to this point
            const transformedPayload = {
                sc_cat_item: payload.catItem,
                variable_set: payload.variableSet,
                order: payload.order
            };

            try {
                responseObject = !payload.updatedVariableSet ?
                    sn_sc.QuestionDesigner.createResource(
                        'question_set',
                        transformedPayload
                    ) :
                    QuestionSetService.updateVariableSet(payload)
            } catch (e) {
                gs.debug(e);
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error creating the question set")
                );
                throw error;
            }

            // Sometimes request is successful but contains errors in response body
            if (responseObject.errCode) {
                gs.debug(responseObject);
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                    gs.getMessage("Error inserting the question set")
                );
                throw error;
            }
            return responseObject;
        }
    };
})();
