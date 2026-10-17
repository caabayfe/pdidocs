            /*
            *  @param {params} params are limited to the required parameters of the route
            */
            (function scriptedRouteConditionFunction(params) {

                    if (!GlidePluginManager.isActive('sn_km_gen_ai')) return { render: false };
                    return {render : new sn_km_center.HealthScoreUtils().isHealthScoreEligible()};
                    
            })(inputProperties);
