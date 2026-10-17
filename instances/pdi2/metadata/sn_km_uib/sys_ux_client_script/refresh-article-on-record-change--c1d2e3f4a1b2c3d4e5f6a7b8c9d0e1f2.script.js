function handler({ api, event }) {
    if (event.name === 'RECORD_WATCHER#MESSAGE_RECEIVED') {
        api.data.get_article_details_1.refresh();
    }
}
