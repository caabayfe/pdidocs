(function executeRule(current, previous /*null when async*/) {
	if (new GlideDateTime(current.span_start).compareTo(new GlideDateTime(current.span_end)) > 0) {
		gs.addErrorMessage(gs.getMessage("Span end must be greater than or equal to span start. tableName:{0}, fromCurrency:{1}, toCurrency:{2}, order:{3}, spanStart:{4}, spanEnd:{5}", [current.getTableName(), current.from_currency, current.to_currency, current.order, current.span_start, current.span_end]));
		current.setAbortAction(true);
	}
})(current, previous);
