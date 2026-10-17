function script({api, event}) {
    api.setState('updatedEncodedQuery', api.context.props.encodedQuery);
}
