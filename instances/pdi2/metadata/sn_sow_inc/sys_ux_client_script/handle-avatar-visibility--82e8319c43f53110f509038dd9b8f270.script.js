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
    let avatars = api.state.authorObject;
    if (event.elementId == 'save_button') {
        let authorList = api.state.authorList;
        let authors = api.state.authorObject;

        let users = [];
        authorList.forEach(function(avatar, index) {
            users.push(avatar.userName);
            let temp = {
                "user": "",
                "imageSrc": "",
                "id": "",
            };
            let alreadySelected = false;
            let noOfSelectedUser = authors.length;
            authors.forEach(function(p, i) {
                if (avatar.userName == p.user)
                    alreadySelected = true;
            });
            if (!alreadySelected) {
                authors.push(temp);
                authors[noOfSelectedUser].user = avatar.userName;
                authors[noOfSelectedUser].id = avatar.id;
                authors[noOfSelectedUser].imageSrc = avatar.imageSrc;
                ++noOfSelectedUser;
            }
        });
        let finalList = [];
        authors.forEach(function(p, i) {
            if (users.includes(p.user))
                finalList.push(p);
        });
        api.setState('authorObject', finalList);
        const addCoAuthors = api.data.save_co_authors_for_post_incident_report;
        addCoAuthors.execute({
            sysId: api.context.props.sysId,
            coAuthors: finalList
        });
        api.setState('disableSave', true);

    } else {
        api.setState('visibleAvatars', avatars);
        api.setState('hideLink', true);
    }

}
