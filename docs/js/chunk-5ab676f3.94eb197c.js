(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5ab676f3"],{1148:function(t,e,r){"use strict";var a=r("a691"),s=r("1d80");t.exports="".repeat||function(t){var e=String(s(this)),r="",n=a(t);if(n<0||n==1/0)throw RangeError("Wrong number of repetitions");for(;n>0;(n>>>=1)&&(e+=e))1&n&&(r+=e);return r}},"159b":function(t,e,r){var a=r("da84"),s=r("fdbc"),n=r("17c2"),o=r("9112");for(var i in s){var c=a[i],l=c&&c.prototype;if(l&&l.forEach!==n)try{o(l,"forEach",n)}catch(u){l.forEach=n}}},"17c2":function(t,e,r){"use strict";var a=r("b727").forEach,s=r("a640"),n=r("ae40"),o=s("forEach"),i=n("forEach");t.exports=o&&i?[].forEach:function(t){return a(this,t,arguments.length>1?arguments[1]:void 0)}},"1dde":function(t,e,r){var a=r("d039"),s=r("b622"),n=r("2d00"),o=s("species");t.exports=function(t){return n>=51||!a((function(){var e=[],r=e.constructor={};return r[o]=function(){return{foo:1}},1!==e[t](Boolean).foo}))}},"408a":function(t,e,r){var a=r("c6b6");t.exports=function(t){if("number"!=typeof t&&"Number"!=a(t))throw TypeError("Incorrect invocation");return+t}},4160:function(t,e,r){"use strict";var a=r("23e7"),s=r("17c2");a({target:"Array",proto:!0,forced:[].forEach!=s},{forEach:s})},"65f0":function(t,e,r){var a=r("861d"),s=r("e8b5"),n=r("b622"),o=n("species");t.exports=function(t,e){var r;return s(t)&&(r=t.constructor,"function"!=typeof r||r!==Array&&!s(r.prototype)?a(r)&&(r=r[o],null===r&&(r=void 0)):r=void 0),new(void 0===r?Array:r)(0===e?0:e)}},"6e04":function(t,e,r){"use strict";r.r(e);var a=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("b-container",{staticClass:"pb-3"},[r("b-row",{staticClass:"pt-3"},[r("b-col",[r("h1",[r("strong",[t._v("Address Explorer")])])])],1),r("b-row",{staticClass:"mb-4"},[r("b-col",[r("b-input-group",{attrs:{prepend:"Currency",size:"lg"}},[r("b-form-select",{attrs:{disabled:t.api_busy,options:t.currency_options},model:{value:t.currency_chosen_value,callback:function(e){t.currency_chosen_value=e},expression:"currency_chosen_value"}})],1)],1)],1),r("b-row",{staticClass:"mt-3 pb-3"},[r("b-col",[r("b-input-group",{attrs:{prepend:"Address Hash",size:"lg"}},[r("b-form-input",{attrs:{id:"address-form-input",placeholder:"33i1YrAZ6y6xfkK819zd7CXup4NMXAPB1C",type:"search",trim:""},model:{value:t.address_entry,callback:function(e){t.address_entry=e},expression:"address_entry"}}),r("b-input-group-append",[r("b-button",{staticClass:"btn",attrs:{disabled:t.api_busy,variant:"primary"},on:{click:function(e){return t.address_populator(t.address_entry)}}},[t.api_busy?r("b-spinner",{attrs:{small:""}}):t._e(),r("b-icon-search")],1)],1)],1)],1)],1),this.$cookies.get("previous_address_searches")?r("b-row",{staticClass:"mb-4"},[r("b-col",[r("b-input-group",{attrs:{prepend:"Previous Searches",size:"lg"}},[r("b-form-select",{attrs:{disabled:t.api_busy,options:t.previous_address_search_selection_options},model:{value:t.previous_address_search_selection,callback:function(e){t.previous_address_search_selection=e},expression:"previous_address_search_selection"}})],1)],1)],1):t._e(),t.address_table_array?r("b-row",{staticClass:"mt-5"},t._l(t.address_table_array,(function(e){return r("b-col",{key:e._id},[r("b-card",{key:e._id,attrs:{id:e._id},scopedSlots:t._u([{key:"header",fn:function(){return[r("b-row",[r("b-col",{staticClass:"d-flex"},[r("div",[r("h4",[t._v(t._s(e._id))])]),r("div",{staticClass:"ml-auto"},[r("b-button",{attrs:{variant:"outline-danger"},on:{click:function(r){return t.address_remover(e._id)}}},[r("strong",[t._v("X")])])],1)])],1)]},proxy:!0}],null,!0)},[r("b-card-body",[e.abuse_count?r("b-row",[r("b-col",[r("b-alert",{attrs:{dismissible:"",show:"",variant:"danger"}},[t._v("BitcoinAbuse: Malicious Activity Identified for this address "),r("a",{attrs:{href:"https://www.bitcoinabuse.com/reports/"+e._id,target:"_blank"}},[t._v(" ("+t._s(e.abuse_count>1?e.abuse_count+" instances":e.abuse_count+" instance")+")")])])],1)],1):t._e(),e.abuse_count?t._e():r("b-row",[r("b-col",[r("b-alert",{attrs:{dismissible:"",show:"",variant:"success"}},[t._v("BitcoinAbuse: No Malicious Activity Identified for this address ")])],1)],1),e.abuse_check?t._e():r("b-row",[r("b-col",[r("b-alert",{attrs:{dismissable:"",show:"",variant:"warning"}},[t._v("Failed to retrieve abuse report")])],1)],1),r("b-row",[r("b-col",[r("b-row",[r("b-table",{staticClass:"pl-2 pr-2",attrs:{fields:t.address_table_fields,items:[e],responsive:!0,"sticky-header":"85vh"}})],1)],1)],1),e.transaction_data?t._e():r("b-row",[r("b-col",[r("b-button",{staticClass:"btn btn-primary btn-block",on:{click:function(r){return t.transaction_populator(e._id)}}},[t.api_busy?r("b-spinner",{attrs:{small:""}}):t._e(),t._v(" Load Additional Data ")],1)],1)],1),e.transaction_data?r("b-row",{},[r("b-col",[r("b-table",{staticClass:"pl-2 pr-2",attrs:{fields:t.transaction_table_fields,items:e.transaction_data,"sort-by":t.transaction_table_sort_by,"sort-desc":!0,bordered:!0,responsive:!0,"sticky-header":"55vh"},on:{"update:sortBy":function(e){t.transaction_table_sort_by=e},"update:sort-by":function(e){t.transaction_table_sort_by=e}},scopedSlots:t._u([{key:"cell(show_details)",fn:function(e){return[r("b-button",{staticClass:"mr-2",attrs:{block:"",size:"sm"},on:{click:e.toggleDetails}},[t._v(" "+t._s(e.detailsShowing?"Hide":"Show")+" Details ")])]}},{key:"row-details",fn:function(e){return[r("b-card",[r("b-row",[r("b-col",[r("h3",[t._v("Transaction Details")])])],1),r("b-row",[r("b-col",[e.item.coinbase_transaction?t._e():r("h3",[t._v("Inputs")]),e.item.coinbase_transaction?r("h3",[t._v("Coinbase Transaction")]):t._e(),e.item.coinbase_transaction?t._e():r("b-table-simple",{attrs:{responsive:!0,stacked:!0}},[r("b-thead",[r("b-tr",[r("b-th",[t._v("Inputs")])],1),r("b-tr",[r("b-th",[t._v("Address")]),r("b-th",[t._v("Value")])],1)],1),r("b-tbody",t._l(e.item.inputs,(function(e){return r("b-tr",{key:e.prev_out.addr},[r("b-td",{attrs:{"stacked-heading":"Value"},domProps:{textContent:t._s(t.currency_formatter(e.prev_out.value))}}),r("b-td",{attrs:{"stacked-heading":"Address"}},[t._v(t._s(e.prev_out.addr))])],1)})),1)],1)],1),r("b-col",[r("h3",[t._v("Outputs")]),r("b-table-simple",{attrs:{responsive:"",stacked:""}},[r("b-thead",[r("b-tr",[r("b-th",[t._v("Outputs")])],1),r("b-tr",[r("b-th",[t._v("Address")]),r("b-th",[t._v("Value")]),r("b-th",[t._v("Output Order")])],1)],1),r("b-tbody",t._l(e.item.out,(function(e){return r("b-tr",{key:e.addr},[r("b-td",{attrs:{"stacked-heading":"Value"},domProps:{textContent:t._s(t.currency_formatter(e.value))}}),r("b-td",{attrs:{"stacked-heading":"Address"}},[r("a",{attrs:{href:"#"+e.addr},on:{click:function(r){return t.address_populator(e.addr)}}},[t._v(t._s(e.addr))])]),r("b-td",{attrs:{"stacked-heading":"Spent"}},[t._v(t._s(e.spent))]),r("b-td",{attrs:{"stacked-heading":"Output Order"}},[t._v(t._s(e.n))])],1)})),1)],1)],1)],1),r("b-row",[r("b-col",[r("span",[t._v("Transaction Hash "+t._s(e.item._id))])])],1)],1)]}}],null,!0)})],1)],1):t._e()],1)],1)],1)})),1):t._e()],1)},s=[],n=(r("99af"),r("4160"),r("fb6a"),r("b0c0"),r("b680"),r("159b"),r("bc3a")),o=r.n(n),i=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}),c=new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}),l=new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR"}),u=new Intl.NumberFormat("en-GB",{style:"currency",currency:"CNY"}),d=new Date;d.setDate(d.getDate()-3);var _=d.toISOString().slice(0,10),b={name:"AddressExplorer",data:function(){var t=this;return{address_entry:null,address_table_fields:[{key:"n_tx",label:"Total TXs"},{key:"total_received",label:"Total Received",formatter:function(e,r,a){return t.currency_formatter(e,r,a)}},{key:"total_sent",label:"Total Sent",formatter:function(e,r,a){return t.currency_formatter(e,r,a)}},{key:"final_balance",label:"Final Balance",formatter:function(e,r,a){return t.currency_formatter(e,r,a)}}],api_busy:!1,address_table_array:[],currency_chosen_value:"XBP",currency_options:[{value:"XBP",text:"₿ XBP"},{value:"USD",text:"$ USD"},{value:"GBP",text:"£ GBP"},{value:"EUR",text:"€ EUR"},{value:"CNY",text:"¥ CNY"}],currency_data:[],previous_address_search_selection:null,previous_address_search_selection_options:null,transaction_table_sort_by:"time",transaction_table_fields:[{key:"coinbase_transaction",label:"",sortable:!0,formatter:function(t){return!0===t?"Coinbase Transaction":""}},{key:"time",label:"Date",sortable:!0,formatter:function(t){return new Date(1e3*t).toLocaleDateString("en-GB")}},{key:"vin_sz",label:"No. Inputs",sortable:!0},{key:"vout_sz",label:"No. Outputs",sortable:!0},{key:"value_inputs",label:"Total Val. Inputs",sortable:!0,formatter:function(e,r,a){return t.currency_formatter(e,r,a)}},{key:"fee",label:"Fee",sortable:!0,formatter:function(e,r,a){return t.currency_formatter(e,r,a,6)}},{key:"value_outputs",label:"Total Val. Outputs",sortable:!0,formatter:function(e){return t.currency_formatter(e)}},{key:"show_details",label:""}]}},mounted:function(){document.title=this.$route.name+this.$root.title_brand,this.currency_value_retriever(),this.$cookies.get("previous_address_searches")&&this.address_main_search_history_cookie()},methods:{makeToast:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];this.$bvToast.toast("".concat(r),{title:"".concat(e),variant:t,solid:!0,noAutoHide:!a})},address_importer:function(t){var e=this;this.address_main_search_history_cookie();var r="".concat(this.$root.api_combined_address,"/address?hash=").concat(t);console.log("Retrieving Extra Address Data from",r);var a={};o.a.get(r).then((function(t){console.log("Address Response Received"),a=t.data,e.api_busy=!1,console.log("Extra Address Data Retrieval Complete"),console.log(a),e.address_table_array.push(a)})).catch((function(t){e.makeToast("danger","Address Import Error",t),console.log(t)}))},transaction_table_importer:function(t){var e=this,r="".concat(this.$root.api_combined_address,"/address/transactions?hash=").concat(t),a=[];console.log("Retrieving Extra Address Transaction Data from ",r),o.a.get(r).then((function(r){var s=0;a=r.data["txs"],console.log(a),e.address_table_array.forEach((function(e,r){e._id===t&&(s=r)}));var n=e.address_table_array[s];n.transaction_data=a,e.$set(e.address_table_array,s,n),console.log("Working Index",s),console.log("Extra data",e.address_table_array)})).catch((function(t){e.makeToast("danger","Address Transaction Import Error",t),console.log(t)}))},address_populator:function(t){var e=this;this.address_entry=null,console.log(t);var r=!0;this.address_table_array.forEach((function(a){a._id===t&&(console.log("Duplicate import prevented"),e.makeToast("warning","Duplicate Import Prevented","".concat(t," has already been imported.")),r=!1)})),r&&this.address_importer(t)},transaction_populator:function(t){console.log("Retrieving Tx for ",t),this.transaction_table_importer(t)},address_remover:function(t){var e=this;this.address_table_array.forEach((function(r,a){r._id===t&&e.$delete(e.address_table_array,a)}))},address_main_search_history_cookie:function(){var t=[],e=new Date;if(this.$cookies.get("previous_address_searches")&&(console.log("Address Explorer retrieving searches from cookie"),t=JSON.parse(this.$cookies.get("previous_address_searches"))),this.address_entry){t.push({address:this.address_entry,request_date:e});var r=JSON.stringify(t);this.$cookies.set("previous_address_searches",r)}t.sort((function(t,e){return new Date(e["request_date"])-new Date(t["request_date"])}));var a=[];for(var s in t){var n=!1;for(var o in a)t[s].address===a[o].address&&(n=!0);n||a.push(t[s])}for(var i in this.previous_address_search_selection_options=[{value:null,text:"Select Address"}],a)this.previous_address_search_selection_options.push({value:a[i],text:"".concat(a[i]["address"])})},currency_value_retriever:function(){var t=this;console.log(_);var e="".concat(this.$root.api_combined_address,"/currency?date_from=").concat(_,"&date_to=").concat(_);console.log("Currency Retrieval",e),o.a.get(e).then((function(e){console.log(e),t.currency_data=e.data})).catch((function(t){console.log("Transaction Retrieval Error:",t)}))},currency_formatter:function(t,e,r){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:2;if("XBP"===this.currency_chosen_value)return(t/1e8).toFixed(2)>0?"₿"+(t/1e8).toFixed(a).toLocaleString("en-GB"):"₿"+(t/1e8).toFixed(6).toLocaleString("en-GB");var s=t/1e8,n=this.currency_data[_][this.currency_chosen_value],o=s*n,d=0;return d=o.toFixed(a)>0?o.toFixed(a):o.toFixed(6),"USD"===this.currency_chosen_value?i.format(d):"GBP"===this.currency_chosen_value?c.format(d):"EUR"===this.currency_chosen_value?l.format(d):"CNY"===this.currency_chosen_value?u.format(d):void 0}},watch:{previous_address_search_selection:function(t){this.address_entry=t["address"]}}},f=b,h=r("2877"),v=Object(h["a"])(f,a,s,!1,null,"fcfb92ae",null);e["default"]=v.exports},8418:function(t,e,r){"use strict";var a=r("c04e"),s=r("9bf2"),n=r("5c6c");t.exports=function(t,e,r){var o=a(e);o in t?s.f(t,o,n(0,r)):t[o]=r}},"99af":function(t,e,r){"use strict";var a=r("23e7"),s=r("d039"),n=r("e8b5"),o=r("861d"),i=r("7b0b"),c=r("50c4"),l=r("8418"),u=r("65f0"),d=r("1dde"),_=r("b622"),b=r("2d00"),f=_("isConcatSpreadable"),h=9007199254740991,v="Maximum allowed index exceeded",p=b>=51||!s((function(){var t=[];return t[f]=!1,t.concat()[0]!==t})),y=d("concat"),m=function(t){if(!o(t))return!1;var e=t[f];return void 0!==e?!!e:n(t)},g=!p||!y;a({target:"Array",proto:!0,forced:g},{concat:function(t){var e,r,a,s,n,o=i(this),d=u(o,0),_=0;for(e=-1,a=arguments.length;e<a;e++)if(n=-1===e?o:arguments[e],m(n)){if(s=c(n.length),_+s>h)throw TypeError(v);for(r=0;r<s;r++,_++)r in n&&l(d,_,n[r])}else{if(_>=h)throw TypeError(v);l(d,_++,n)}return d.length=_,d}})},a640:function(t,e,r){"use strict";var a=r("d039");t.exports=function(t,e){var r=[][t];return!!r&&a((function(){r.call(null,e||function(){throw 1},1)}))}},ae40:function(t,e,r){var a=r("83ab"),s=r("d039"),n=r("5135"),o=Object.defineProperty,i={},c=function(t){throw t};t.exports=function(t,e){if(n(i,t))return i[t];e||(e={});var r=[][t],l=!!n(e,"ACCESSORS")&&e.ACCESSORS,u=n(e,0)?e[0]:c,d=n(e,1)?e[1]:void 0;return i[t]=!!r&&!s((function(){if(l&&!a)return!0;var t={length:-1};l?o(t,1,{enumerable:!0,get:c}):t[1]=1,r.call(t,u,d)}))}},b0c0:function(t,e,r){var a=r("83ab"),s=r("9bf2").f,n=Function.prototype,o=n.toString,i=/^\s*function ([^ (]*)/,c="name";a&&!(c in n)&&s(n,c,{configurable:!0,get:function(){try{return o.call(this).match(i)[1]}catch(t){return""}}})},b680:function(t,e,r){"use strict";var a=r("23e7"),s=r("a691"),n=r("408a"),o=r("1148"),i=r("d039"),c=1..toFixed,l=Math.floor,u=function(t,e,r){return 0===e?r:e%2===1?u(t,e-1,r*t):u(t*t,e/2,r)},d=function(t){var e=0,r=t;while(r>=4096)e+=12,r/=4096;while(r>=2)e+=1,r/=2;return e},_=c&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!i((function(){c.call({})}));a({target:"Number",proto:!0,forced:_},{toFixed:function(t){var e,r,a,i,c=n(this),_=s(t),b=[0,0,0,0,0,0],f="",h="0",v=function(t,e){var r=-1,a=e;while(++r<6)a+=t*b[r],b[r]=a%1e7,a=l(a/1e7)},p=function(t){var e=6,r=0;while(--e>=0)r+=b[e],b[e]=l(r/t),r=r%t*1e7},y=function(){var t=6,e="";while(--t>=0)if(""!==e||0===t||0!==b[t]){var r=String(b[t]);e=""===e?r:e+o.call("0",7-r.length)+r}return e};if(_<0||_>20)throw RangeError("Incorrect fraction digits");if(c!=c)return"NaN";if(c<=-1e21||c>=1e21)return String(c);if(c<0&&(f="-",c=-c),c>1e-21)if(e=d(c*u(2,69,1))-69,r=e<0?c*u(2,-e,1):c/u(2,e,1),r*=4503599627370496,e=52-e,e>0){v(0,r),a=_;while(a>=7)v(1e7,0),a-=7;v(u(10,a,1),0),a=e-1;while(a>=23)p(1<<23),a-=23;p(1<<a),v(1,1),p(2),h=y()}else v(0,r),v(1<<-e,0),h=y()+o.call("0",_);return _>0?(i=h.length,h=f+(i<=_?"0."+o.call("0",_-i)+h:h.slice(0,i-_)+"."+h.slice(i-_))):h=f+h,h}})},b727:function(t,e,r){var a=r("0366"),s=r("44ad"),n=r("7b0b"),o=r("50c4"),i=r("65f0"),c=[].push,l=function(t){var e=1==t,r=2==t,l=3==t,u=4==t,d=6==t,_=7==t,b=5==t||d;return function(f,h,v,p){for(var y,m,g=n(f),w=s(g),k=a(h,v,3),x=o(w.length),S=0,A=p||i,C=e?A(f,x):r||_?A(f,0):void 0;x>S;S++)if((b||S in w)&&(y=w[S],m=k(y,S,g),t))if(e)C[S]=m;else if(m)switch(t){case 3:return!0;case 5:return y;case 6:return S;case 2:c.call(C,y)}else switch(t){case 4:return!1;case 7:c.call(C,y)}return d?-1:l||u?u:C}};t.exports={forEach:l(0),map:l(1),filter:l(2),some:l(3),every:l(4),find:l(5),findIndex:l(6),filterOut:l(7)}},e8b5:function(t,e,r){var a=r("c6b6");t.exports=Array.isArray||function(t){return"Array"==a(t)}},fb6a:function(t,e,r){"use strict";var a=r("23e7"),s=r("861d"),n=r("e8b5"),o=r("23cb"),i=r("50c4"),c=r("fc6a"),l=r("8418"),u=r("b622"),d=r("1dde"),_=r("ae40"),b=d("slice"),f=_("slice",{ACCESSORS:!0,0:0,1:2}),h=u("species"),v=[].slice,p=Math.max;a({target:"Array",proto:!0,forced:!b||!f},{slice:function(t,e){var r,a,u,d=c(this),_=i(d.length),b=o(t,_),f=o(void 0===e?_:e,_);if(n(d)&&(r=d.constructor,"function"!=typeof r||r!==Array&&!n(r.prototype)?s(r)&&(r=r[h],null===r&&(r=void 0)):r=void 0,r===Array||void 0===r))return v.call(d,b,f);for(a=new(void 0===r?Array:r)(p(f-b,0)),u=0;b<f;b++,u++)b in d&&l(a,u,d[b]);return a.length=u,a}})},fdbc:function(t,e){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}}}]);
//# sourceMappingURL=chunk-5ab676f3.94eb197c.js.map