function script({api, event}) {  
    api.setState('rawTopics',api.data.get_topics_list.output.data.now.taxonomy.getTopicHierarchy )
}
