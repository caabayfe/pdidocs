function transform(input) {
    var obj = input.topicResponse;
    var obj2 = {};
    var level = 0;

    function operation(object) {

        var obji = {};
        for (var i = 0; i < object.length; ++i) {
            obji[object[i]["id"]] = {
                "id": object[i]["id"],
                "label": object[i]["label"]
            };
        }
        obj2["level_" + level] = obji;

        var level_x = "level_" + level;
        for (var _i = 0; _i < object.length; _i++) {
            if (object[_i].children !== undefined && object[_i].children.length) {
                level = level + 1;
                // insert (reference : level) pair => obj2.level_x[i].reference = level;
                obj2[level_x][object[_i]["id"]].reference = "level_" + level;
                operation(object[_i].children);
            }
        }
    }

    operation(obj);
    return obj2;
}
