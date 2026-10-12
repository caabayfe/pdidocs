function handler({api, event, imports}) {
    api.setState("query",api.data.get_encoded_query_to_prefill_knowledge_form.query);
}
