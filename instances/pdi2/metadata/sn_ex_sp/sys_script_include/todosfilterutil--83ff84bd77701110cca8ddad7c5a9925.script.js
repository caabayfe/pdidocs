var TodosFilterUtil = Class.create();
TodosFilterUtil.prototype = Object.extendsObject(TodosFilterUtilSNC, {
    initialize: function() {
        TodosFilterUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'TodosFilterUtil'
});
