function evaluate({api,helpers}) {
    const displayStyle = api.context.props.payload.buttonsDisplay;
    if (!displayStyle)
       return false;

    return !(displayStyle === 'flex_column');
}
