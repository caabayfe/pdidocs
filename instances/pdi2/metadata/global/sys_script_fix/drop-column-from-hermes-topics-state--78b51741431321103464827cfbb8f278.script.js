function dropOldColumn() {
    gs.print("Now dropping the column 'topic_seq' from 'hermes_topics_state'.");
    gs.dropColumn('topic_seq', 'hermes_topics_state');
}

dropOldColumn();
