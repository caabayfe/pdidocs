function evaluateProperty({
    api,
    helpers
}) {
    const {
        type,
        title,
        url
    } = api.item.value;

    return !(type && title && url && /^(document|video)$/.test(type));

}
