try {
    answer = current.batch_result.getRefRecord().canRead();
} catch (ex) {
    answer = false;
}
