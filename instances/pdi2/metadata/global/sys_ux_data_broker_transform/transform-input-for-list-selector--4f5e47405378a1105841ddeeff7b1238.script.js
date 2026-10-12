function transform(input) {

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
            if (array_obj[i].children.length) {
                response_array = search(sys_id, array_obj[i].children);
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
