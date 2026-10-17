/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let userList = [];
    let usersids = [];
    api.data.look_up_active_itil_users.results.forEach(function(user, i) {
        if (!usersids.includes(user.user.value)) {
            var userDetails = {};
            userDetails["avatarProps"] = {};
            userDetails["id"] = user.user.value;
            userDetails["avatarProps"].imageSrc = user.user._reference.avatar.displayValue;
            userDetails["avatarProps"].userName = user.user._reference.name.displayValue;
            userDetails["label"] = user.user._reference.name.displayValue;
            userList.push(userDetails);
            usersids.push(user.user.value);
        }
    });
    api.setState("itilUsers", userList);
    api.setState("searchUserKey", "");
}
