
        
            /*
            *  @param {params} params are limited to the required parameters of the route
            */
            (function scriptedRouteConditionFunction(params) {
                var editor = 'TINYMCE';

                // Retrieve all extensions for the EditorSelector extension point
                var eps = new GlideScriptedExtensionPoint().getExtensions(
                    'sn_km_center.EditorSelector'
                );

                // If there are no extension points, check the property to determine if ECE should be used
                if (!eps.length && gs.getProperty('sn_km_center.glide.knowman.ece.enable', 'false') === 'true') {
                    editor = 'ECE';
                } else {
                    // Process the extension points and get the final editor
                    eps.forEach(function(ep) {
                        try {
                            ep.initialize();
                            var result = ep.getActiveEditor(params);
                            // Check for unexpected or empty values
                            if (result && typeof result === 'string') {
                                editor = result;
                            } else {
                                gs.warn('EditorSelector extension returned invalid value: ' + result, 'Knowledge Center Record Screen Condition');
                            }
                        } catch (e) {
                            gs.error('Error in EditorSelector extension: ' + e, 'Knowledge Center Record Screen Condition');
                        }
                    });
                }

                return {
                    editor : editor
                };
            
            })(inputProperties);
