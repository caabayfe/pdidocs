/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.data.fetch_incident_related_data.output != null) {
        let timingsSchema = api.state.timingsSchema;
        let incidentTimings = api.data.fetch_incident_related_data.output.incidentTimings;
        let translatedLabels = api.data.fetch_incident_related_data.output.timelineLabels;

        timingsSchema.forEach(function(time, index) {
            time["label"] = translatedLabels[index];
            time["value"]["value"] = incidentTimings[index];
        });
        api.setState('timingsSchema', JSON.parse(JSON.stringify(timingsSchema)));

        let publishBy = api.data.fetch_incident_related_data.output.publishBy;
        let pirState = api.data.fetch_incident_related_data.output.pirState;
        if (publishBy == null || pirState == await helpers.translate('Published'))
            api.setState('hideAlert', true);
        else {
            api.setState('hideAlert', false);
        }

        let coAuthors = api.data.fetch_incident_related_data.output.coAuthors;
        let authorData = [];

        coAuthors.forEach(function(user, index) {
            let obj = {
                "user": "",
                "imageSrc": "",
                "id": ""
            };
            obj.user = user.user;
            obj.id = user.id;
            obj.imageSrc = user.imageSrc;

            authorData.push(obj);
        });
        api.setState('authorObject', authorData);

        const authorListData = [];
        coAuthors.forEach(function(author, index) {
            let obj = {
                "userName": "",
                "imageSrc": "",
                "id": ""
            };
            obj.userName = author.user;
            obj.id = author.id;
            obj.imageSrc = author.imageSrc;

            authorListData.push(obj);
        });
        api.setState('authorList', authorListData);

        const selected = [];

        coAuthors.forEach(function(user, index) {
            let obj = {
                "id": "",
                "label": "",
                "avatarProps": {
                    "imageSrc": ""
                }
            };
            obj.id = user.id;
            obj.label = user.user;
            obj.avatarProps = {};
            obj.avatarProps.imageSrc = user.imageSrc;

            selected.push(obj);
        });
        api.setState('coAuthorsSelected', selected);

        const cardDetails = api.data.fetch_incident_related_data.output.relatedRecords;
        api.setState('cardDetails', cardDetails);

        const incidentSummary = api.data.fetch_incident_related_data.output.summary;
        api.setState('incidentSummary', incidentSummary);

        const accessPermission = api.data.fetch_incident_related_data.output.access_permission;
        api.setState('accessPermission', accessPermission);
        
        if (authorData.length > 5) {
            let req = authorData.length - 5;
            api.setState('additionalAvatarCount', "+" + req);
            api.setState('visibleAvatars', authorData.slice(0, 5));
            api.setState('hideLink', false);
        } else {
            api.setState('visibleAvatars', authorData);
            api.setState('hideLink', true);
        }
    }
}
