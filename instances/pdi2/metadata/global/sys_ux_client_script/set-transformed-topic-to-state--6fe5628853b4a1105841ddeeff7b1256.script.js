function script({api, event}) {
    api.setState('allTopics', api.data.topic_data_transformation_from_hierarchichal_to_list_selector.listSelectorObject);
}
