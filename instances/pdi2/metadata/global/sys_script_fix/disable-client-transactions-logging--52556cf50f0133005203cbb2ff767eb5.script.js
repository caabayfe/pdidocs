if (!pm.isZboot()) {
    if (gs.getProperty('glide.ui.response_time') == 'false')
        gs.setProperty('glide.client.track_transaction_timings', 'false');
}
