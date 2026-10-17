function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === 'INDEXING_COMPLETE') {
        location.reload();
    }
}
