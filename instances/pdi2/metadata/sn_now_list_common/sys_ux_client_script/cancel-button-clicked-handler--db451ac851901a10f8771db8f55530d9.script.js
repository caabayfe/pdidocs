function script({api, event}) {
    api.setState('updatedEncodedQuery', api.context.props.encodedQuery);
    api.emit('LIST_CTRL#PREDICATE_BUILDER_CANCELED');
}
