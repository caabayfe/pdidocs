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
    const getSubLabel = (title, location) => {
        let sublabel = '';

        if (title) {
            sublabel = title;
            if (location)
                sublabel += ` | ${ location}`;

        } else if (location)
            sublabel = location;

        return sublabel;
    };

    const userLookUpResult = api.data.look_up_user_records.results.map((e) => {
        const photo = e.photo.value;
        const imageSrc = photo ? `/sys_attachment.do?sys_id=${photo}` : '';

        const sub = getSubLabel(e.title.value, e.company.displayValue);
        return {
            id: e.sys_id.value,
            label: e.name.value,
            type: 'user',
            sublabel: sub.length > 0 ? sub : 'User',
            avatarProps: {
                userName: e.name.value,
                imageSrc,
            },
            new: true
        };
    });

    api.setState('fetchedUsers', userLookUpResult);
}
