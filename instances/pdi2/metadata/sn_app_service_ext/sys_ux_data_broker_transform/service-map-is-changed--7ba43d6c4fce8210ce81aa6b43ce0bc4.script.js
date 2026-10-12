function transform(input) {

    if (!input.id || !input.changeTypes)
        return;

    let parameters = {
        changeTypes: JSON.stringify(input.changeTypes),
        id: input.id
    };

    const isChangedResultStr = new global.ApplicationServiceGraphDataAPIs().getApplicationServiceApiResponse("isChanged", parameters);
    if (!isChangedResultStr)
        return null;

    let isChangedResultJSON = JSON.parse(isChangedResultStr);
    if (isChangedResultJSON.types)
        isChangedResultJSON.types = JSON.parse(isChangedResultJSON.types);

    return isChangedResultJSON;
}
