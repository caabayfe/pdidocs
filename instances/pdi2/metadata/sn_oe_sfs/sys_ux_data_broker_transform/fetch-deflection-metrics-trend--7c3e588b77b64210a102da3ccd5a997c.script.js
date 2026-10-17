function transform(input) {
    return new VaAdminConsoleMetrics().getDeflections(input.from_date, input.to_date);
}
