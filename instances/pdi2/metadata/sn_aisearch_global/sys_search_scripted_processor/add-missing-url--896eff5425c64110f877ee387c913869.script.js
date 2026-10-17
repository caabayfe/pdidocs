function process(record) {
      if (record.getUrl()) return;
      if (record.getTable() === "kb_knowledge") {
        record.setUrl("kb_view.do?sys_kb_id="+record.getSysId()+"&preview_article=true");
      } else if (record.getTable() === "sc_cat_item") {
        record.setUrl("com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id="+record.getSysId());
      }

      return;
    }
    
