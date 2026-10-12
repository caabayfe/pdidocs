import{html as e,nothing as t}from"lit";import{msg as r,str as s}from"@lit/localize";import{state as i,customElement as l}from"lit/decorators.js";import{decorators as o,AIUXWidgetElement as a}from"@servicenow/aiux-components-core";import{createGraphQLClient as n}from"@servicenow/aiux-components-record";function p(e,t,r,s){var i,l=arguments.length,o=l<3?t:s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,r,s);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(o=(l<3?i(o):l>3?i(t,r,o):i(t,r))||o);return l>3&&o&&Object.defineProperty(t,r,o),o}let{category:d,discoverable:c}=o,_=`
  query($sysId: String!) {
    GlideRecord_Query {
      {{table}}(sys_id: $sysId) {
        _results {
          text          { value }
          sys_updated_on { displayValue }
          sys_view_count { displayValue }
        }
      }
    }
  }
`,u=/^[a-zA-Z_][a-zA-Z0-9_]*$/,h=n();class y extends a{static{this.ssr=!1}static{this.properties={knowledge_table:{type:Object},knowledge_record:{type:Object}}}updated(){let e=this.knowledge_table?.value,t=this.knowledge_record?.value,r=`${e}:${t}`;e&&t&&r!==this._lastFetchKey&&(this._lastFetchKey=r,this._fetch(e,t))}async _fetch(e,t){this._loading=!0,this._error=!1;try{if(!u.test(e)){this._error=!0;return}let r=_.replace("{{table}}",e),{data:s,errors:i}=await h.query(r,{sysId:t});if(i?.length)throw Error(i[0].message);let l=s?.GlideRecord_Query?.[e]?._results?.[0];if(!l){this._error=!0;return}this._snippet=function(e,t=280){if(!e)return"";let r=String(e).replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();return r.length>t?`${r.slice(0,t).trimEnd()}…`:r}(l.text?.value??""),this._updated=l.sys_updated_on?.displayValue??"",this._views=l.sys_view_count?.displayValue??""}catch{this._error=!0}finally{this._loading=!1}}render(){if(!this.knowledge_table?.value||!this.knowledge_record?.value)return e`<p class="text-sm text-base-content/40 italic" role="status">
        ${r("No knowledge article available.")}
      </p>`;if(this._loading)return e`<p class="text-sm text-base-content/40 italic" role="status">
        ${r("Loading…")}
      </p>`;if(this._error)return e`<p class="text-sm text-error" role="alert">
        ${r("Could not load the knowledge article.")}
      </p>`;let{_snippet:i,_updated:l,_views:o}=this;return e`
      <div class="flex flex-col gap-2">
        ${i?e`<p class="text-sm text-base-content/80 leading-relaxed">${i}</p>`:t}
        ${l||o?e`<p class="text-xs text-base-content/50">
              ${r(s`Updated ${l} · ${o} views`)}
            </p>`:t}
      </div>
    `}constructor(...e){super(...e),this._snippet=null,this._updated="",this._views="",this._loading=!0,this._error=!1,this._lastFetchKey=""}}p([i()],y.prototype,"_snippet",void 0),p([i()],y.prototype,"_updated",void 0),p([i()],y.prototype,"_views",void 0),p([i()],y.prototype,"_loading",void 0),p([i()],y.prototype,"_error",void 0),y=p([c(!0),d("platform"),l("playbook-knowledge-article")],y);export{y as default};
//# sourceMappingURL=playbook-knowledge-article-cjZW1nNp.js.map
