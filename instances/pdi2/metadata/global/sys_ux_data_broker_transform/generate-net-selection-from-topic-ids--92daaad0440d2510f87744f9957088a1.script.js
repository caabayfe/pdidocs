function transform(input) {
    var sysIdArray = input.sysIdArray;

    function topicToTaxonomyMapping(_sysIdArray) {
        var _topicToTaxonomy = {};

        for (var i = 0; i < _sysIdArray.length; ++i) {
            var gr = new GlideRecord('topic');
            gr.get(_sysIdArray[i]);
            _topicToTaxonomy[_sysIdArray[i]] = gr.taxonomy.toString();
        }

        return _topicToTaxonomy;
    }

    function taxonomyToTopicGrouping(_topicToTaxonomy) {
        var _taxonomyGroup = {};
        for (var _topic in _topicToTaxonomy) {
            var taxonomy = _topicToTaxonomy[_topic];
            if (taxonomy in _taxonomyGroup) {
                _taxonomyGroup[taxonomy].push(_topic);
            } else {
                _taxonomyGroup[taxonomy] = [_topic];
            }
        }
        return _taxonomyGroup;
    }

    function transformInputForListSelector(input) {

        function search(sys_id, array_obj) {
            for (var i = 0; i < array_obj.length; i++) {
                if (array_obj[i].id == sys_id) {
                    var obj_i = {
                        "id": array_obj[i].id,
                        "label": array_obj[i].label
                    };
                    return [obj_i];
                }
                var response_array = undefined;
                if (array_obj[i].items.length) {
                    response_array = search(sys_id, array_obj[i].items);
                }
                if (response_array && response_array.length) {
                    response_array.unshift({
                        "id": array_obj[i].id,
                        "label": array_obj[i].label
                    });
                    return response_array;
                }
            }
            return undefined;
        }

        function operation2(sys_id_arr, topicResponse) {
            var obj_selected = [];

            for (var _i = 0; _i < sys_id_arr.length; ++_i) {
                var search_i = search(sys_id_arr[_i], topicResponse);
                if (search_i && search_i.length) {
                    obj_selected.unshift(search_i);
                }
            }
            
            return obj_selected;
        }

        return operation2(input.sysIdArray, input.topicResponse);
    }

    function operation(sys_id_arr) {
        var topicToTaxonomy = topicToTaxonomyMapping(sys_id_arr);
        var taxonomyToTopicGroup = taxonomyToTopicGrouping(topicToTaxonomy);

        var netSelection = {};
        for (var taxonomy in taxonomyToTopicGroup) {
            var _sysIdArray2 = taxonomyToTopicGroup[taxonomy];
            var topicHierarcy = new global.TaxonomyUtil().getTopicsHierarchy(taxonomy);
            topicHierarcy = (topicHierarcy == null) ? [] : topicHierarcy;

            var selectedTopicsObject = transformInputForListSelector({ sysIdArray: _sysIdArray2, topicResponse: topicHierarcy });
            netSelection[taxonomy] = selectedTopicsObject;
        }
        return netSelection;
    }

    return operation(sysIdArray);
}
