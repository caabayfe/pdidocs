function ActionParameterService($rootScope) {
    var ACTION_PARAMETER_EVENT = "dynamicParameterForAction";
    return {
        broadcast: function(actionParameter, value) {
            var paramObj = {};
            paramObj[actionParameter] = value;
            $rootScope.$broadcast(ACTION_PARAMETER_EVENT, paramObj);
        },

        listen: function(fn) {
            $rootScope.$on(ACTION_PARAMETER_EVENT, fn);
        }
    };
}
