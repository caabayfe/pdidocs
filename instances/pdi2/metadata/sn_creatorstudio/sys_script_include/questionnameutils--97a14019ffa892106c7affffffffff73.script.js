const QuestionNameUtils = (function() {
    return class QuestionNameUtils {
        static type = "QuestionNameUtils";
        static TABLE_NAME = "item_option_new";

        /**
         * Throws an unauthorized read error with a custom message indicating
         * insufficient permissions to read a record from the table.
         *
         * @throws {Error} Throws an error indicating unauthorized access to a record.
         */
        static throwUnauthorizedReadError() {
            throw ErrorService.createError(
                ErrorService.ERROR_TYPES.UNAUTHORIZED,
                gs.getMessage(
                    "Insufficient permissions to read record in {0} table",
                    QuestionNameUtils.TABLE_NAME
                )
            );
        }

        /**
         * Generates a random string of lowercase characters. Defaults to a length of 12.
         * 
         * @returns {string} A random string of lowercase characters.
         * @private
         */
        static #makeRandomString(length = 12) {
            return GlideSecureRandomUtil.getSecureRandomString(length).toLocaleLowerCase();
        }

        /**
         * Removes leading non-letter characters from the given string, 
         * returning the substring that starts with the first letter found.
         *
         * @param {string} str - The input string to process.
         * @returns {string} - The string starting from the first letter, or the original string if no letters are found.
         */
        static removeLeadingNonLetters(str) {
            const match = str.match(/[a-zA-Z]/); // Find the first letter in the string. Validated safe.
            return match ? str.slice(match.index) : str; // Return from the first letter or the original string
        }

        /**
         * Normalizes a label by:
         * - Converting to lowercase
         * - Removing non-alphanumeric and non-underscore characters
         * - Replacing spaces with underscores
         * - Collapsing multiple underscores into one
         * - Ensuring the name doesn't start with a number
         *
         * @param {string} label - The label to convert.
         * @returns {string} The normalized name.
         */
        static createNameFromLabel(label) {
            let name = label
                .toLowerCase()
                // RegExs all validated as safe.
                .replace(/[^a-zA-Z0-9_ ]/g, '') // Remove invalid characters, except spaces.
                .replace(/\s+/g, '_') // Replace spaces with underscores.
                .replace(/_+/g, '_'); // Collapse multiple underscores

            // If name starts with a digit, remove leading non-letters
            if (/^\d/.test(name)) {
                name = QuestionNameUtils.removeLeadingNonLetters(name);
            }
            //Fix for non-English labels: if name is exactly "_<digits>", prefix with "question"
            else if (/^_\d+$/.test(name)) {
                name = `question${name}`;
            }
            return name;
        }

        /**
         * Checks if the question's name has been manually changed by comparing the current name 
         * to the name generated from the question's original label.
         *
         * @param {string} sysId - The sys_id of the question record to check.
         * @returns {string|null} The manually changed name if found, otherwise null.
         */
        static isNameManuallyChanged(sysId) {
            const gr = new GlideRecordSecure(QuestionNameUtils.TABLE_NAME);

            const isNewRecord = !gr.get(sysId);
            if (!gr.canRead())
                QuestionNameUtils.throwUnauthorizedReadError();

            if (!isNewRecord) {
                const oldLabel = gr.getDisplayValue('question_text');
                const oldName = gr.getDisplayValue('name');
                const nameToCompare = QuestionNameUtils.createNameFromLabel(oldLabel);
                if (oldName !== nameToCompare)
                    return oldName; // Return the old name if manually changed
            }
            return null; // Return null if not manually changed
        }

        /**
         * Generates a unique name based on the question's text, ensuring it doesn't collide with existing names.
         * If no unique name is found after 100 attempts, appends the question's sysId.
         *
         * @param {Object} question - The question object containing the question text, sysId, and category item.
         * @returns {string} A unique name for the question.
         * @private
         */
        static makeName(question) {
            const {
                questionText,
                sysId,
                catItem
            } = question;

            // Check if the name was manually changed, and return the old name if true
            const manuallyChangedName = QuestionNameUtils.isNameManuallyChanged(sysId);
            if (manuallyChangedName) return manuallyChangedName;

            // Retrieve all existing names for the category item once
            const existingNames = QuestionNameUtils.getCatItemQuestionNamesExcluding(sysId, catItem);

            // Create a base name from the label
            const baseName = QuestionNameUtils.createNameFromLabel(questionText);
            let name = baseName;

            const maxAttempts = 100;
            let suffix = 1;

            // Try to create a unique name, and if the limit is reached, append a random string.
            while (existingNames.has(name)) {
                if (suffix > maxAttempts) {
                    name = `${baseName}_${QuestionNameUtils.#makeRandomString()}`;
                    break;
                }
                name = `${baseName}${suffix}`;
                suffix++;
            }

            return name;
        }

        /**
         * Retrieves the catalog item associated with a given question.
         *
         * @param {string} sysId - The sys_id of the question record.
         * @returns {string|null} - The sys_id of the associated catalog item, or null if not found.
         */
        static getCatItemFromQuestion(sysId) {
            const gr = new GlideRecordSecure(QuestionNameUtils.TABLE_NAME);
            gr.get(sysId);
            if (!gr.canRead())
                QuestionNameUtils.throwUnauthorizedReadError();
            return gr.getValue('cat_item');
        }

        /**
         * Retrieves all question names associated with the given category item, excluding the specified question.
         * If the `catItem` is not provided, it fetches it using the provided `sysId`.
         *
         * @param {string} sysId - The sys_id of the question to exclude.
         * @param {string} [catItem] - The sys_id of the category item. If not provided, the category item will be retrieved using the sys_id of the question.
         * @returns {Array<string>} An array of question names associated with the category item, excluding the specified question.
         */
        static getCatItemQuestionNamesExcluding(sysId, catItem) {
            // catItem is undefined when QuestionService transaction is update rather than insert
            if (!catItem)
                catItem = QuestionNameUtils.getCatItemFromQuestion(sysId);

            const gr = new GlideRecordSecure(QuestionNameUtils.TABLE_NAME);
            if (!gr.canRead())
                QuestionNameUtils.throwUnauthorizedReadError();
            if (sysId) // New questions do not have a sysId
                gr.addQuery('sys_id', '!=', sysId); // Exclude the specified question
            gr.addQuery('cat_item', catItem);
            gr.query();

            const names = new Set();
            while (gr.next()) {
                names.add(gr.getDisplayValue('name'));
            }

            return names;
        }
    };
})();
