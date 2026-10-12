var ValidationRules = Class.create();
ValidationRules.prototype = {
    initialize: function() {},

    type: 'ValidationRules'
};
ValidationRules.REQUIRED_DATE = {
    type: "string",
    required: true
};
ValidationRules.OPTIONAL_DATE = {
    type: "string",
    required: false
};
ValidationRules.REQUIRED_NUMBER = (min = 0, max = Infinity) => ({
    type: "number",
    required: true,
    min,
    max
});
ValidationRules.OPTIONAL_NUMBER = (min = 0, max = Infinity) => ({
    type: "number",
    required: false,
    min,
    max
});
ValidationRules.REQUIRED_STRING = (minLength = 0, maxLength = 200) => ({
    type: "string",
    required: true,
    minLength,
    maxLength
});
ValidationRules.OPTIONAL_STRING = (minLength = 0, maxLength = 200) => ({
    type: "string",
    required: false,
    minLength,
    maxLength
});
ValidationRules.OPTIONAL_LIST = () => ({
    type: "object",
    required: false,
});
