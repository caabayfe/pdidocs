var DefaultValueProvider = Class.create();
DefaultValueProvider.prototype = {
    initialize: function() {},

    getDetailsScriptDefaultValue: function() {
        return "(function(file) {\n" +
            "\t// The application file being operated on is called 'file'. The function must return an object.\n" +
            "\t// The object's keys will override any calculated values from the configuration.\n" +
            "\t// Keys available to override are: name, description, launch_url, editor_url\n" +
            "\t// The fields name, description, and type should be translated values\n" +
            "\treturn {};\n" +
            "})(globalFileObjectRecord);";
    },

    type: 'DefaultValueProvider'
};
