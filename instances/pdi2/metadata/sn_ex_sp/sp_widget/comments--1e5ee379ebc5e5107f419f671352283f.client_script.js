api.controller = function($scope, $window, $http) {
    var c = this;
    var liveProfiles = {};
    liveProfiles[$scope.user] = {
        userID: $scope.user,
        name: $scope.user.name,
        initials: $window.NOW.user_initials
    };
    if ($window.NOW.user_avatar) {
        liveProfiles[$scope.user].userImage = $window.NOW.user_avatar;
    }

    c.getLiveProfileByUserId = function(userId) {
        return liveProfiles[userId];
    };

    var pending = {};

    //Little caching implementation to make sure we only get a given user's profile once.
    c.hasLiveProfile = function(userId) {
        if (!userId)
            return false;

        if (liveProfiles[userId])
            return true;

        if (pending[userId])
            return false;

        pending[userId] = $http.get('/api/now/live/profiles/sys_user.' + userId).then(function(response) {
            liveProfiles[userId] = {
                userID: userId,
                name: response.data.result.name,
                initials: buildInitials(response.data.result.name),
                avatar: response.data.result.avatar
            };
        });
        return false;
    };

    c.getUser = function(userName) {
        return buildInitials(userName);
    };

    function buildInitials(name) {
        if (!name)
            return "--";

        var initialMatchRegex = /^[A-ZÀ-Ÿ]|^[\u3040-\u309f]|^[\u30a0-\u30ff]|^[\uff66-\uff9f]|^[\u4e00-\u9faf]/;
        // Included Hiragana, Katakana, CJK Unified Ideographs and Halfwidth and Fullwidth Forms Blocks 
        // Hiragana -> Japanese words, Katakana -> foreign words
        // CJK Unified Ideographs -> modern Chinese, Japanese, Korean and Vietnamese characters 

        var initials = name.split(" ").map(function(word) {
            return word.toUpperCase();
        }).filter(function(word) {
            return word.match(initialMatchRegex);
        }).map(function(word) {
            return word.substring(0, 1);
        }).join("");

        return (initials.length > 3) ? initials.substr(0, 3) : initials;
    }
};
