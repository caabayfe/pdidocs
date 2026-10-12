var RelatedListItemUpdateHandler = Class.create();
    RelatedListItemUpdateHandler.prototype = {
        initialize: function() {
         // called before postupdate, all initializations can go here.
        },

        handles: function(extensionPointKey) {
            return extensionPointKey == "DEFAULT";
        },

        postUpdate: function(reqInfo) {
         // called before setting the response.
        },

        type: 'RelatedListItemUpdateHandler'
    };
