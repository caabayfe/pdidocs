
    function getNLUEnityValuesDiffValues(prev, curr) {
        var prevList = prev.split(',');
        var currList = curr.split(',');

        return prevList.filter(function (val) {
            return currList.indexOf(val) == -1;
        });
    }

    (function executeRule(current, previous /*null when async*/) {

        try {
            var entity = current.sys_id;
            var values = getNLUEnityValuesDiffValues(previous.values_list, current.values_list || "");

            if (values && values.length > 0) {
                var gr = new GlideRecord('m2m_sys_nlu_utterance_entity');
                gr.addQuery('entity', entity);
                gr.query();

                while (gr.next()) {

                    var annotation = gr.getValue('annotation');
                    var annotJson = JSON.parse(annotation);
                    var newAnnotations = annotJson.filter(function (rec) {
                        return values.indexOf(rec.cat) == -1;
                    });

                    if (newAnnotations.length == 0) {
                        gr.deleteRecord();
                    } else {
                        gr.setValue('annotation', JSON.stringify(newAnnotations));
                        gr.update();
                    }
                }
            }
        } catch (e) {
            gs.debug("Error in NLU Entity Update : " + e.message);
        }
    })(current, previous);
