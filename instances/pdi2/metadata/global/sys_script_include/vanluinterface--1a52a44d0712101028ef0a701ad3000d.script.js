var VANLUInterface = Class.create();
var APPLICATION_NAME = 'VA';
var TOPIC_TYPE = 'VA Topic';
var TOPIC_LANG_TABLE = 'sys_cb_topic_language';
var CS_TOPIC_LANG_TABLE = 'sys_cs_topic_language';
var CS_TOPIC_TABLE = 'sys_cs_topic';
var CB_TOPIC_TABLE = 'sys_cb_topic';
var MODEL_FIELD = 'nlu_model';
var INTENT_FIELD = 'nlu_intent';
var TOPIC_ID_FIELD = 'cb_topic_id';

function _getMappedIntentCount(model, intents) {
    var result = {};

    var aggr = new GlideAggregate(TOPIC_LANG_TABLE);
    if (model) aggr.addQuery(MODEL_FIELD, model);
    if (intents) aggr.addQuery(INTENT_FIELD, intents);
    aggr.addNotNullQuery(INTENT_FIELD);
    aggr.addAggregate('COUNT', MODEL_FIELD);
    aggr.query();
    while (aggr.next()) {
        result[aggr.getValue(MODEL_FIELD)] = aggr.getAggregate('COUNT', MODEL_FIELD);
    }

    return result;
}

VANLUInterface.prototype = {

    /**
        Returns all the mapped intents count for each model
        Supports optional filter 'models' in format:
        {
            <model1>: [<intent11>, <intent12>, ...],
            <model2>: [<intent21>, <intent22>, ...],
            ...
        }
        Result:
        {
            <model>: <intent count>
            ...
        }
    */
    getAllMappedIntentsCount: function(models) {
        if (models) {
            var result = {};
            for (var model in models) {
                result[model] = _getMappedIntentCount(model, models[model])[model] || 0;
            }
            return result;
        } else {
            return _getMappedIntentCount();
        }
    },

    /**
        Returns all mapped intent details for given model
        Optionally we can provide list of intents to filter the result.
        Result:
        {
            application: <Consumer application name: VA or Search>,
            mappings: {
                <intent name>: [{
                    id: <Unique ID - topic sys_id or template id>,
                    name: <Type of the mapping (VA Topic or Genius Template): Topic name or genius template name>,
                    link: <Direct link to the topic or template>,
                    isTopicActive: <Whether or not the mapped topic is active in sys_cs_topic>,
                    isIntentPublished: <Whether or not the intent is published with the mapped topic in sys_cs_topic_language>,
                    isIntentSaved: <Whether or not the intent is saved with the mapped topic in sys_cb_topic_language>
                }]
                ...
            }
        }
    */
    getMappedIntents: function(model, intents) {
        var mappings = {};
        var allTopicIds = {};
        var mappedTopic;
        var existing;
        var publishedIntent;
        var savedIntent;
        var isTopicActive;
        var topicName;
        var cbTopicId;
        var intentName;
        var csTopicId;

        var cbTopicsWithSavedIntents = {};
        var gr = new GlideRecord(TOPIC_LANG_TABLE);
        gr.addQuery(MODEL_FIELD, model);
        gr.addNotNullQuery(INTENT_FIELD);
        if (intents) gr.addQuery(INTENT_FIELD, intents);
        gr.query();
        while (gr.next()) {
            cbTopicId = gr.getValue(TOPIC_ID_FIELD);
            intentName = gr.getValue(INTENT_FIELD);
            allTopicIds[cbTopicId] = true;
            cbTopicsWithSavedIntents[cbTopicId] = intentName;
        }

        var csTopicIds = {};
        var csTopicsWithPublishedIntents = {};
        var gr2 = new GlideRecord(CS_TOPIC_LANG_TABLE);
        gr2.addQuery(MODEL_FIELD, model);
        gr2.addNotNullQuery(INTENT_FIELD);
        gr2.addQuery('cs_topic_id.name', 'NOT LIKE', '_PRVW__%');
        if (intents) gr2.addQuery(INTENT_FIELD, intents);
        gr2.query();
        while (gr2.next()) {
            csTopicId = gr2.getValue('cs_topic_id');
            intentName = gr2.getValue(INTENT_FIELD);
            csTopicIds[csTopicId] = true;
            csTopicsWithPublishedIntents[csTopicId] = intentName;
        }

        var csCbTopicMap = {};
        var csGr = new GlideRecord(CS_TOPIC_TABLE);
        csGr.addQuery('sys_id', 'IN', Object.keys(csTopicIds));
        csGr.query();
        while (csGr.next()) {
            csCbTopicMap[csGr.getValue('sys_id')] = csGr.getValue('cb_topic_id');
        }

        var cbTopicsWithPublishedIntents = {};
        Object.keys(csTopicsWithPublishedIntents).forEach(function(csTopicId) {
            cbTopicId = csCbTopicMap[csTopicId];
            allTopicIds[cbTopicId] = true;
            cbTopicsWithPublishedIntents[cbTopicId] = csTopicsWithPublishedIntents[csTopicId];
        });

        var topicNamesMap = {};
        var cbTopicGr = new GlideRecord(CB_TOPIC_TABLE);
        cbTopicGr.addQuery('sys_id', 'IN', Object.keys(allTopicIds));
        cbTopicGr.query();
        while (cbTopicGr.next()) {
            topicNamesMap[cbTopicGr.getValue('sys_id')] = cbTopicGr.getValue('name');
        }

        var activeTopicsMap = {};
        var csTopicGr = new GlideRecord(CS_TOPIC_TABLE);
        csTopicGr.addActiveQuery();
        csTopicGr.addQuery('name', 'NOT LIKE', '_PRVW__%');
        csTopicGr.addQuery('cb_topic_id', 'IN', Object.keys(allTopicIds));
        csTopicGr.query();
        while (csTopicGr.next()) {
            activeTopicsMap[csTopicGr.getValue('cb_topic_id')] = true;
        }

        function _buildTopic(topicId, topicName, isTopicActive, isIntentPublished, isIntentSaved) {
            return {
                id: topicId,
                name: TOPIC_TYPE + ': ' + topicName,
                link: '/$conversation-builder.do#/topic/' + topicId,
                isTopicActive: isTopicActive,
                isIntentPublished: isIntentPublished,
                isIntentSaved: isIntentSaved
            };
        }

        Object.keys(allTopicIds).forEach(function(topicId) {
            publishedIntent = cbTopicsWithPublishedIntents[topicId];
            savedIntent = cbTopicsWithSavedIntents[topicId];
            isTopicActive = activeTopicsMap[topicId] === true;
            topicName = topicNamesMap[topicId];
            if (savedIntent) {
                mappedTopic = _buildTopic(topicId, topicName, isTopicActive, savedIntent === publishedIntent, true);
                existing = mappings[savedIntent];
                mappings[savedIntent] = existing ? existing.concat(mappedTopic) : [mappedTopic];
            }
            if (publishedIntent && publishedIntent !== savedIntent) {
                mappedTopic = _buildTopic(topicId, topicName, isTopicActive, true, false);
                existing = mappings[publishedIntent];
                mappings[publishedIntent] = existing ? existing.concat(mappedTopic) : [mappedTopic];
            }
        });
        return {
            application: APPLICATION_NAME,
            mappings: mappings
        };
    },
    initialize: function() {},
    type: 'VANLUInterface'
};
