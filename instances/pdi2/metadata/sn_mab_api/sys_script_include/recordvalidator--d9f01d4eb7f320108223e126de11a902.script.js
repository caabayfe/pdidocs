class RecordValidator {
  /**
   *
   * @param {string} table
   * @param {{}} record
   * @return {string|undefined}
   */
  validate(table, record) {
    const gr = new GlideRecordSecure(table);
    gr.initialize();

    for (const field in record) {
      try {
        const element = gr.getElement(field);
        const descriptor = element.getED();
        const value = record[field];
        const errorMessage = this.validateField(descriptor, value);
        if (errorMessage) return errorMessage;
      } catch (error) {
        return `invalid field: ${field}`;
      }
    }
  }

  validateField(descriptor, value) {
    if (descriptor.getInternalType() === 'reference') {
      return this.validateReferenceField(descriptor, value);
    }
    if (descriptor.getInternalType() === 'table_name') {
      return this.validateTableNameField(descriptor, value);
    }
  }

  validateReferenceField(descriptor, value) {
    const referenceTable = descriptor.getReference();
    if (referenceTable) {
      const gr = new GlideRecordSecure(referenceTable);
      if (!gr.get(value)) {
        return `invalid reference: ${value} on field ${descriptor.getName()}`;
      }
    }
  }

  validateTableNameField(descriptor, value) {
    if (!gs.tableExists(value)) {
      return `invalid table, ${value}`;
    }
  }
}

module.exports = RecordValidator;
