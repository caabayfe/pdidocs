function domainDefaults() {
  return [
    {
      model_type: 'ITSM',
      default_table: {
        table_name: 'incident',
        field: 'short_description',
        user_fields: ['state', 'contact_type', 'assignment_group', 'opened_at', 'closed_at', 'sys_updated_on']
      }
    }
  ];
}
