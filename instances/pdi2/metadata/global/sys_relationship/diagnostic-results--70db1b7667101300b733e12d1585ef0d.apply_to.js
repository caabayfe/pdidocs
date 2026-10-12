var diagnostics = new GlideRecord('pa_diagnostic');
diagnostics.addActiveQuery();
diagnostics.addQuery('table', table_name);
diagnostics.setLimit('1');
diagnostics.query();
answer = diagnostics.next();
