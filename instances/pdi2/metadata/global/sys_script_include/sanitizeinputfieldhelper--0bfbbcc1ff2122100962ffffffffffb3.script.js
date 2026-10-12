var SanitizeInputFieldHelper = Class.create();
SanitizeInputFieldHelper.prototype = {
    initialize: function () {},

    sanitizeField: function (input) {
        if (JSUtil.notNil(input)) {

            var patterns = [
                "<script>(.*?)</script>",
                "<script(.*?)>",
                "eval\\((.*?)\\)",
                "javascript:",
                "vbscript:",
                "alert(.*?)",
                "prompt(.*?)",
                "src=",
                "<(.*?)",
                "(.*?)>",
                "GlideRecord\\s*\\(",
                "gs\\.[a-zA-Z]+\\s*\\(",
                "[<>{}\"'`;()]"
            ];

            patterns.forEach(function(pattern) {
                var regex = new RegExp(pattern, "gi");
                input = input.replace(regex, "");
            });
        }

        return input;
    },

    type: "SanitizeInputFieldHelper"
};
