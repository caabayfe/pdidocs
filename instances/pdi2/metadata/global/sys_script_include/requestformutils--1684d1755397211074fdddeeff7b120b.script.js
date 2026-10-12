var RequestFormUtils = Class.create();
RequestFormUtils.prototype = (function() {

    function _createChoicesForQuestion(sysId, choices) {
        if (!sysId)
            return;

        var output = new Array();

        if (choices && !Array.isArray(choices))
            return output;

        if (choices.length < 1)
            return output;

        choices.forEach(function(choice) {
            var choiceGR = new GlideRecord('question_choice');
            choiceGR.initialize();

            if (!choiceGR.canWrite()) {
                gs.debug("Insufficient permissions to create choices for record " + sysID);
                return;
            }

            choiceGR.setValue('text', choice.label);
            choiceGR.setValue('value', choice.value);
            choiceGR.setValue('question', sysId);
            choiceGR.setValue('order', choice.index);
            choiceGR.insert();

            var newChoice = {
                index: choiceGR.getValue('order'),
                value: choiceGR.getValue('value'),
                label: choiceGR.getValue('text')
            };

            output.push(newChoice);
        });

        return output;
    }

    function _deleteChoicesForQuestion(sysId) {
        if (!sysId)
            return;

        // find all question choices with question === sysId and delete
        var rpGR = new GlideRecordSecure('question_choice');
        rpGR.addQuery('question', sysId);
        rpGR.query();
        while (rpGR.next()) {
            if (!rpGR.deleteRecord())
                throw new Error(gs.getMessage("Failed to delete question choice with sys_id {0}", rpGR.getUniqueValue()));
        }
        return true;
    }


    return {
        initialize: function() {},

        /**
         * Creates choice records for a given item_option_new record
         * 
         * @param {string} sysId - the sysId of the variable
         * @param {array} choices - Array of choice objects { label, value, index }
         * @returns {object} an array of created choices
         */
        createChoicesForQuestion: function(sysId, choices) {
            if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
                throw new Error("This must be called from sn_creatorstudio scope");
            }

			return _createChoicesForQuestion(sysId, choices);
        },

        /**
         * Delete choice records for a given item_option_new record
         * 
         * @param {string} sysId - the sysId of the variable
         * @returns {boolean} true if all existing choices are deleted. Throws error is a delete fails.
         */
        deleteChoicesForQuestion: function(sysId) {
            if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
                throw new Error("This must be called from sn_creatorstudio scope");
            }

			return _deleteChoicesForQuestion(sysId);
        },

        /**
         * Replace choice records for a given item_option_new record
         * 
         * @param {string} sysId - the sysId of the variable
         * @param {array} choices - Array of choice objects { label, value, index }
         * @returns {object} an array of created choices
         */
        replaceChoicesForQuestion: function(sysId, choices) {
            if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
                throw new Error("This must be called from sn_creatorstudio scope");
            }

            if (_deleteChoicesForQuestion(sysId)) {
                var output = _createChoicesForQuestion(sysId, choices);
                return output;
            }
        },

        /**
         * Return choice records for a given item_option_new record
         * 
         * @param {string} sysId - the sysId of the variable
         * @returns {array} choices - Array of choice objects { label, value, index }
         */
        getChoicesForQuestion: function(sysId) {
            if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
                throw new Error("This must be called from sn_creatorstudio scope");
            }

            if (!sysId)
                return;

            var choices = [];

            // find all question choices with question === sysId
            var rpGR = new GlideRecordSecure('question_choice');
            rpGR.addQuery('question', sysId);
            rpGR.query();
            while (rpGR.next()) {
                choices.push({
                    label: rpGR.getValue('text'),
                    value: rpGR.getValue('value'),
                    index: rpGR.getValue('order')
                });
            }
            return choices;
        },

        type: 'RequestFormUtils'
    };
}());
