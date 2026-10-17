var UXARequestValidator = Class.create();
UXARequestValidator.prototype = {
    initialize: function() {},

    validate: function(schema = {}, options = {}) {
        const errors = [];

        for (const key in schema) {
            const rules = schema[key];
            const value = options[key];

            //If no rule found for given field
            if (!rules)
                continue;

            //Check if its required field
            if (rules.required && (value === undefined || value === null || value === "")) {
                errors.push(`${key} is required`);
                continue;
            }

            // if its optional field and has no value
            if (value === undefined || value === null) continue;

            // field type validation
            if (rules.type && typeof value !== rules.type) {
                errors.push(`${key} should be of type ${rules.type}`);
            }

            // string validation
            if (typeof value === "string") {
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${key} must be at most ${rules.maxLength} characters`);
                }
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${key} must be at least ${rules.minLength} characters`);
                }
            }

            // Number validation
            if (typeof value === "number") {
                if (rules.min !== undefined && value < rules.min) {
                    errors.push(`${key} should be at least ${rules.min}`);
                }

                if (rules.max !== undefined && value > rules.max) {
                    errors.push(`${key} should be at most ${rules.max}`);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(`Validation error : ${errors.join("\n- ")}`);
        }
    },

    type: 'UXARequestValidator'
};
