var vocabTypes = NLUConstants.VOCAB_TYPES;

function getValuesCount(record) {
    try {
        if (record.type == vocabTypes.lookup) {
            if (record.table) {
                var valsGa = new GlideAggregate(record.table);
                valsGa.addAggregate('COUNT');
                if (record.filter_condition) {
                    valsGa.addEncodedQuery(record.filter_condition);
                }
                valsGa.query();
                if (valsGa.next()) {
                    return valsGa.getAggregate('COUNT');
                }
            }
        } else if (record.type == vocabTypes.static_lookup) {
            var vocabJsonStr = record.vocabulary_json;
            if (vocabJsonStr) {
                var vocabJson = JSON.parse(vocabJsonStr);
                if (vocabJson && vocabJson.values && Array.isArray(vocabJson.values)) {
                    return vocabJson.values.length;
                }
            }
        }
    } catch (e) {
        gs.error('Error while checking the value count for lookup: ' + e.message);
    }
    return 0;
}

(function executeRule(current, previous /*null when async*/ ) {

    if ((current.type == vocabTypes.lookup || current.type == vocabTypes.static_lookup) && !current.name.match(/^[^.@\s]*$/)) {
        gs.addErrorMessage(gs.getMessage('Handle cannot contain @, space or dot'));
        current.setAbortAction(true);
        return;
    }

    var limitProp = null;
    if (current.type == vocabTypes.lookup) {
        limitProp = 'glide.platform_ml.api.max_nlu_lookupsource_records';
    } else if (current.type == vocabTypes.static_lookup) {
        limitProp = 'glide.nlu.static_lookup.value_limit';
    }
    if (limitProp) {
        var limit = parseInt(gs.getProperty(limitProp));
        var valueCount = parseInt(getValuesCount(current));
        if (valueCount > limit) {
            gs.addErrorMessage(gs.getMessage('Cannot refer to more than {0} values', limit));
            current.setAbortAction(true);
            return;
        }
    }

    var ga = new GlideAggregate('sys_nlu_vocabulary');
    ga.addAggregate('COUNT');
    ga.addQuery('name', current.name);
    ga.addQuery('model', current.model);
    ga.addQuery('sys_id', '!=', current.sys_id);
    ga.query();
    if (ga.next()) {
        if (ga.getAggregate('COUNT') > 0) {
            gs.addErrorMessage(gs.getMessage('Word already exists.'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
