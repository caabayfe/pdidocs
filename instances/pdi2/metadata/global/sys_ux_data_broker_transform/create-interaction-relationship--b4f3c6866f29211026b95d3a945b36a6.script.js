function transform(input) {
	sn_interaction.RelatedRecord.createOrUpdate(input.interactionSysID, input.documentTable, input.documentID, input.operation);
}
