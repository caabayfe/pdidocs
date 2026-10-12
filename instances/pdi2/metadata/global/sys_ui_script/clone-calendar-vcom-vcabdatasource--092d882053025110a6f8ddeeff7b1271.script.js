(function() {
    'use strict';

    /*
     * Use this service in angular components and vcab widgets to access the data.
     */
    angular.module('sn.itsm.vcab.common')
        .factory('vcabDataSource', function($http, $q, Tables, $log, dataUtil, $rootScope) {           
            var CLONE_META_API = '/api/now/clone_request_calendar/clone/';

            function getNewPromise(promise, transformResult) {
                return $q(function(resolve, reject) {					
                    promise.then(function(response) {
                        var r = response.data.result;
                        if (transformResult)
                            r = transformResult(r);		
                        resolve(r);
                    }, function(response) {
                        reject(response);
                    });
                });
            }

            var Source = {
                change: {
                    getRelatedWindows: function(sysId, startDate, endDate) {
                        return getNewPromise($http.get(CLONE_META_API + sysId + '/' + dataUtil.jsToWsDate(startDate, true) + '/' + dataUtil.jsToWsDate(endDate, true)));
                    },
                }
            };
            return Source;
        });

}());
