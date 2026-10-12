import{html as t,nothing as e}from"lit";import{msg as o}from"@lit/localize";import{customElement as s}from"lit/decorators.js";import{decorators as i,AIUXWidgetElement as l}from"@servicenow/aiux-components-core";let{category:a,discoverable:r}=i;class c extends l{static{this.aiContext={description:"A list of records shown as part of the current playbook step.",bestFor:"When the user asks about the records in the current step, wants to filter, sort, or open one of them."}}static{this.properties={list_title:{type:Object},table:{type:Object},associated_table:{type:Object},list_query:{type:Object},row_count:{type:Object},ui_view:{type:Object},columns:{type:Object}}}render(){let s=this.list_title?.value,i=this.table?.value??this.associated_table?.value,l=this.list_query?.value,a=this.row_count?.value,r=this.ui_view?.value,c=this.columns?.value;return i?t`
      ${s?t`<h2 class="text-lg font-semibold text-base-content mb-3">
            ${s}
          </h2>`:e}
      <aiux-list-connected
        table="${i}"
        query="${l||""}"
        .pageSize="${a}"
        columns="${c||""}"
        view="${r||"default"}"
      ></aiux-list-connected>
      ></aiux-list-connected>
    `:t`<p class="text-sm text-base-content/40 italic" role="status">
        ${o("No list data available.")}
      </p>`}}c=function(t,e,o,s){var i,l=arguments.length,a=l<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,s);else for(var r=t.length-1;r>=0;r--)(i=t[r])&&(a=(l<3?i(a):l>3?i(e,o,a):i(e,o))||a);return l>3&&a&&Object.defineProperty(e,o,a),a}([r(!0),a("platform"),s("playbook-list")],c);export{c as default};
//# sourceMappingURL=playbook-list-CiWOT-J0.js.map
