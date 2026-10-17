(function() {
            var sysDictionaryGr = new GlideRecord("sys_dictionary");
            sysDictionaryGr.addQuery("name", "sys_sg_ui_parameter");
            sysDictionaryGr.addQuery("element", "button");
            sysDictionaryGr.query();
            if(!sysDictionaryGr.next())
                return;
            
            sysDictionaryGr.setValue("reference_qual", "javascript:new SgReferenceQualifiers().getGroupedInputReferenceQualifier();");
            sysDictionaryGr.update();
            })();
        
