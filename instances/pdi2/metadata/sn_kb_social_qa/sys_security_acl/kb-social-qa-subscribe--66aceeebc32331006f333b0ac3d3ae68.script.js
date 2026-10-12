answer = execute();

function execute() {
    return new SocialQACommon().canCreate(current.question.kb_knowledge_base);
}
