var NLUIntent = Class.create();

(function() {

    var constants = global.NLUConstants.constants;
    var tables = global.NLUConstants.tables;

    NLUIntent.getGRById = function(intentId) {
        var gr = new GlideRecord(tables.SYS_NLU_INTENT);
        if (gr.get(intentId)) return gr;

        return null;
    };

    NLUIntent.getIntentsGr = function(intentIds) {
        var intentGr = new GlideRecord(tables.SYS_NLU_INTENT);
        intentGr.addQuery('sys_id', intentIds);
        intentGr.query();

        return intentGr;
    };

    NLUIntent.getDataFromGR = function(intentRec) {
        var intents = [];

        while (intentRec.next()) {
            intents.push({
                id: intentRec.getValue('sys_id'),
                name: intentRec.getValue('name'),
                createdOnTimestamp: NLUHelper.toTimezoneAdjustedTimestamp(
                    new GlideDateTime(intentRec.getValue('sys_created_on'))),
                enabled: intentRec.getValue('enable') !== "0"
            });
        }
        return intents;
    };

    NLUIntent.forEachIntentEntityMap = function(intentIds, callback) {
        var ieGr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
        ieGr.addJoinQuery(tables.SYS_NLU_ENTITY, 'entity', 'sys_id');
        ieGr.addQuery('intent', 'IN', intentIds);
        ieGr.query();

        while (ieGr.next()) {
            var intentId = ieGr.getValue('intent');
            var relationship = ieGr.getValue('relationship');
            var entityGr = ieGr.entity.getRefRecord();
            callback(intentId, relationship, entityGr);
        }
    };

    NLUIntent.prototype = {

        type: 'NLUIntent',

        initialize: function(intentId) {
            this.intentId = intentId;
        },

        createIntentEntityMap: function(entityId, relationship, disableBr) {
            if (!entityId) return;
            var mapGr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
            mapGr.initialize();
            mapGr.setValue('entity', entityId);
            mapGr.setValue('intent', this.intentId);
            mapGr.setValue('relationship', relationship);
            if (disableBr) mapGr.setWorkflow(false);
            return mapGr.insert();
        },

        getEntities: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_ENTITY);
            gr.addNullQuery('model');
            var joinQuery = gr.addJoinQuery(tables.M2M_SYS_NLU_INTENT_ENTITY, 'sys_id', 'entity');
            joinQuery.addCondition('intent', this.intentId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getUtterances: function(filter) {
            var gr = new GlideRecord(tables.SYS_NLU_UTTERANCE);
            gr.addQuery('intent', this.intentId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        getIntentEntities: function(filter) {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
            gr.addQuery('intent', this.intentId);
            if (filter) gr.addEncodedQuery(filter);
            gr.query();

            return gr;
        },

        deleteIntentEntities: function(filter) {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
            gr.addQuery('intent', this.intentId);
            if (filter) gr.addEncodedQuery(filter);
            gr.deleteMultiple();
        },

        /**
         * Get all unique utterance IDs in a given list of utterance Ids when
         * compared to all the utterances in a given intentId
         * 
         * @param {String} intentId Intent ID whose utterances need to be
         * compared with the given utterances
         * @param {*} utterances A stringified array of objects with below format
         * {
         *  sysId // sys_id of the utterance
         *  text // deserialized text of the utterance
         * }
         */
        getUniqueUtteranceIds: function(data) {

            try {
                var utterances = JSON.parse(data);
                var targetUttrGr = this.getUtterances();
                var targetUttrTexts = [];
                var uniqueUttrIds = [];

                while (targetUttrGr.next()) {
                    targetUttrTexts.push(
                        NLUStudioTrainer.deserialiseUtterance(
                            targetUttrGr.getValue('utterance')
                        )
                    );
                }

                utterances.forEach(function(utterance) {
                    var uttrId = utterance.sysId;
                    var uttrText = utterance.text;

                    if (targetUttrTexts.indexOf(uttrText) < 0) {
                        uniqueUttrIds.push(uttrId);
                    }
                });
            } catch (error) {
                gs.error('NLUIntent: Error while validating unique utterances ' + error);
                return null;
            }

            return uniqueUttrIds;
        }
    };

})();
