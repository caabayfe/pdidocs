angular.module('sn.$sp').config(['$compileProvider',function( $compileProvider ){ 
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|msteams|zoomtg):/) ;
}]);
