
            
                var EditorSelector = Class.create();
                EditorSelector.prototype = {
                    initialize: function() {
                    },

                    // Returns the editor key to use for the current context.
                    // Extend this logic to return other editor keys if additional editors are integrated.
                    getActiveEditor: function(/*object*/ params) {
                        var eceEnabled = gs.getProperty('sn_km_center.glide.knowman.ece.enable', 'false') === 'true';
                        return eceEnabled ? 'ECE' : 'TINYMCE';
                    },

                    type: 'EditorSelector'
                };
