(function(context, pageParams, blockcontext) {
    var suffixRegex = /( Copy)([0-9]+)$/;
    var copyNameSuffix = ' Copy';

    var trimSuffixIfPresent = function(modelName) {
        var pos = modelName.search(suffixRegex);
        if (pos > -1) {
            return modelName.substring(0, pos);
        }
        if (modelName.length > 33) return modelName.substring(0, 33);
        return modelName;
    };

    var trimModelName = function(modelName, cloneNames) {
        var trimLength = modelName.length - 40;
        var pos = modelName.search(suffixRegex);
        if (trimLength > 0) {
            var name = modelName.substring(0, pos - trimLength) + modelName.substring(pos);
            if (!cloneNames.includes(name)) return getAUniqueName(name, cloneNames);
            return name;
        }
        return modelName;
    };

    var getCloneModelName = function(name, sequence, cloneNames) {
        var cloneModelName;
        sequence += 1;
        if (suffixRegex.test(name)) {
            cloneModelName = name.replace(
                suffixRegex,
                function(match, p1) {
                    return p1 + sequence;
                }
            );
        } else {
            cloneModelName = name + copyNameSuffix + sequence;
        }
        return cloneModelName.length <= 40 ? cloneModelName : trimModelName(cloneModelName, cloneNames);
    };

    var getAUniqueName = function(modelName, existingModels) {
        var name = trimSuffixIfPresent(modelName);
        var cloneNames = existingModels.filter(function(nm) {
            return nm.includes(name + copyNameSuffix);
        });
        var sequence = 0;
        for (var i = 0; i < cloneNames.length; i += 1) {
            if (suffixRegex.test(cloneNames[i])) {
                var num = parseInt(cloneNames[i].match(suffixRegex)[2], 10);
                if (num > sequence) sequence = num;
            }
        }
        return getCloneModelName(name, sequence, cloneNames);
    };

    var modelNames = [];
    var modelGr = new GlideRecord('sys_nlu_model');
    modelGr.query();
    while (modelGr.next())
        modelNames.push(modelGr.getValue('display_name'));

    var selectedModel = blockcontext.modelToDuplicateName;
    var modelName = getAUniqueName(selectedModel, modelNames);
    var duplicateModelName = getAUniqueName(selectedModel, modelNames);
    return duplicateModelName;

})(context, pageParams, blockcontext);
