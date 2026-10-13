var NotifyOnTaskAjaxProcessor_V2 = Class.create();
NotifyOnTaskAjaxProcessor_V2.prototype = Object.extendsObject(global.NotifyOnTaskAjaxProcessorSNC_V2, {
    initialize: function (request, responseXML, gc, data) {
        global.NotifyOnTaskAjaxProcessorSNC_V2.prototype.initialize.apply(this, arguments);
    },
    type: 'NotifyOnTaskAjaxProcessor_V2'
});
