answer = execute();

function execute() {
    return new SocialQACommon().canCreateVoteorComment(current.reference_name, current.reference_id);
}
