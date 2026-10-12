var AMBUtils = Class.create();
AMBUtils.prototype = {
    initialize: function() {
    },

    generateInternalName: function(current) {
        var scope = current.sys_scope.scope;
        if (scope == null)
            scope = 'global';

        var internal_name = this._toSnakeCase(current.name);
        if (internal_name == '') {
            gs.addErrorMessage('Name field must contain at least one alphanumeric character.');
            return 'invalid';
        }

        return scope + '_' + internal_name;
    },

    _toSnakeCase: function(str) {
        if (!str)
            return '';

        return str
            .trim()
            // Replace spaces and non-alphanumeric sequences with underscore
            .replace(/[^a-zA-Z0-9]+/g, '_')
            // Insert underscore between acronym and next word, e.g. "SNWeb" -> "SN_Web"
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            // Insert underscore between lowercase and uppercase, e.g. "myVariable" -> "my_Variable"
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            // Insert underscore after number when followed by letter, e.g. "variable123Name" -> "variable123_Name"
            .replace(/([0-9])([a-zA-Z])/g, '$1_$2')
            .toLowerCase()
            // Remove leading/trailing underscores
            .replace(/^_+|_+$/g, '');
    },

    type: 'AMBUtils'
};
