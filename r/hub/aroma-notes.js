/*! Aroma Hub notes. Bundles html-to-image 1.11.13 (MIT, github.com/bubkoo/html-to-image). */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).htmlToImage={})}(this,(function(t){"use strict";function e(t,e,n,r){return new(n||(n=Promise))((function(i,o){function u(t){try{a(r.next(t))}catch(t){o(t)}}function c(t){try{a(r.throw(t))}catch(t){o(t)}}function a(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(u,c)}a((r=r.apply(t,e||[])).next())}))}function n(t,e){var n,r,i,o,u={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function c(c){return function(a){return function(c){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,c[0]&&(u=0)),u;)try{if(n=1,r&&(i=2&c[0]?r.return:c[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,c[1])).done)return i;switch(r=0,i&&(c=[2&c[0],i.value]),c[0]){case 0:case 1:i=c;break;case 4:return u.label++,{value:c[1],done:!1};case 5:u.label++,r=c[1],c=[0];continue;case 7:c=u.ops.pop(),u.trys.pop();continue;default:if(!(i=u.trys,(i=i.length>0&&i[i.length-1])||6!==c[0]&&2!==c[0])){u=0;continue}if(3===c[0]&&(!i||c[1]>i[0]&&c[1]<i[3])){u.label=c[1];break}if(6===c[0]&&u.label<i[1]){u.label=i[1],i=c;break}if(i&&u.label<i[2]){u.label=i[2],u.ops.push(c);break}i[2]&&u.ops.pop(),u.trys.pop();continue}c=e.call(t,u)}catch(t){c=[6,t],r=0}finally{n=i=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,a])}}}var r,i=(r=0,function(){return r+=1,"u".concat("0000".concat((Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)).concat(r)});function o(t){for(var e=[],n=0,r=t.length;n<r;n++)e.push(t[n]);return e}var u=null;function c(t){return void 0===t&&(t={}),u||(u=t.includeStyleProperties?t.includeStyleProperties:o(window.getComputedStyle(document.documentElement)))}function a(t,e){var n=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return n?parseFloat(n.replace("px","")):0}function s(t,e){void 0===e&&(e={});var n,r,i,o=e.width||(r=a(n=t,"border-left-width"),i=a(n,"border-right-width"),n.clientWidth+r+i),u=e.height||function(t){var e=a(t,"border-top-width"),n=a(t,"border-bottom-width");return t.clientHeight+e+n}(t);return{width:o,height:u}}var l=16384;function f(t,e){return void 0===e&&(e={}),t.toBlob?new Promise((function(n){t.toBlob(n,e.type?e.type:"image/png",e.quality?e.quality:1)})):new Promise((function(n){for(var r=window.atob(t.toDataURL(e.type?e.type:void 0,e.quality?e.quality:void 0).split(",")[1]),i=r.length,o=new Uint8Array(i),u=0;u<i;u+=1)o[u]=r.charCodeAt(u);n(new Blob([o],{type:e.type?e.type:"image/png"}))}))}function h(t){return new Promise((function(e,n){var r=new Image;r.onload=function(){r.decode().then((function(){requestAnimationFrame((function(){return e(r)}))}))},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=t}))}function d(t){return e(this,void 0,void 0,(function(){return n(this,(function(e){return[2,Promise.resolve().then((function(){return(new XMLSerializer).serializeToString(t)})).then(encodeURIComponent).then((function(t){return"data:image/svg+xml;charset=utf-8,".concat(t)}))]}))}))}function v(t,r,i){return e(this,void 0,void 0,(function(){var e,o,u;return n(this,(function(n){return e="http://www.w3.org/2000/svg",o=document.createElementNS(e,"svg"),u=document.createElementNS(e,"foreignObject"),o.setAttribute("width","".concat(r)),o.setAttribute("height","".concat(i)),o.setAttribute("viewBox","0 0 ".concat(r," ").concat(i)),u.setAttribute("width","100%"),u.setAttribute("height","100%"),u.setAttribute("x","0"),u.setAttribute("y","0"),u.setAttribute("externalResourcesRequired","true"),o.appendChild(u),u.appendChild(t),[2,d(o)]}))}))}var p=function(t,e){if(t instanceof e)return!0;var n=Object.getPrototypeOf(t);return null!==n&&(n.constructor.name===e.name||p(n,e))};function g(t,e,n,r){var i=".".concat(t,":").concat(e),o=n.cssText?function(t){var e=t.getPropertyValue("content");return"".concat(t.cssText," content: '").concat(e.replace(/'|"/g,""),"';")}(n):function(t,e){return c(e).map((function(e){var n=t.getPropertyValue(e),r=t.getPropertyPriority(e);return"".concat(e,": ").concat(n).concat(r?" !important":"",";")})).join(" ")}(n,r);return document.createTextNode("".concat(i,"{").concat(o,"}"))}function m(t,e,n,r){var o=window.getComputedStyle(t,n),u=o.getPropertyValue("content");if(""!==u&&"none"!==u){var c=i();try{e.className="".concat(e.className," ").concat(c)}catch(t){return}var a=document.createElement("style");a.appendChild(g(c,n,o,r)),e.appendChild(a)}}var w="application/font-woff",y="image/jpeg",b={woff:w,woff2:w,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:y,jpeg:y,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function S(t){var e=function(t){var e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}(t).toLowerCase();return b[e]||""}function E(t){return-1!==t.search(/^(data:)/)}function x(t,e){return"data:".concat(e,";base64,").concat(t)}function C(t,r,i){return e(this,void 0,void 0,(function(){var e,o;return n(this,(function(n){switch(n.label){case 0:return[4,fetch(t,r)];case 1:if(404===(e=n.sent()).status)throw new Error('Resource "'.concat(e.url,'" not found'));return[4,e.blob()];case 2:return o=n.sent(),[2,new Promise((function(t,n){var r=new FileReader;r.onerror=n,r.onloadend=function(){try{t(i({res:e,result:r.result}))}catch(t){n(t)}},r.readAsDataURL(o)}))]}}))}))}var P={};function R(t,r,i){return e(this,void 0,void 0,(function(){var e,o,u,c,a;return n(this,(function(n){switch(n.label){case 0:if(e=function(t,e,n){var r=t.replace(/\?.*/,"");return n&&(r=t),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),e?"[".concat(e,"]").concat(r):r}(t,r,i.includeQueryParams),null!=P[e])return[2,P[e]];i.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+(new Date).getTime()),n.label=1;case 1:return n.trys.push([1,3,,4]),[4,C(t,i.fetchRequestInit,(function(t){var e=t.res,n=t.result;return r||(r=e.headers.get("Content-Type")||""),function(t){return t.split(/,/)[1]}(n)}))];case 2:return u=n.sent(),o=x(u,r),[3,4];case 3:return c=n.sent(),o=i.imagePlaceholder||"",a="Failed to fetch resource: ".concat(t),c&&(a="string"==typeof c?c:c.message),a&&console.warn(a),[3,4];case 4:return P[e]=o,[2,o]}}))}))}function T(t){return e(this,void 0,void 0,(function(){var e;return n(this,(function(n){return"data:,"===(e=t.toDataURL())?[2,t.cloneNode(!1)]:[2,h(e)]}))}))}function A(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return t.currentSrc?(e=document.createElement("canvas"),i=e.getContext("2d"),e.width=t.clientWidth,e.height=t.clientHeight,null==i||i.drawImage(t,0,0,e.width,e.height),[2,h(e.toDataURL())]):(o=t.poster,u=S(o),[4,R(o,u,r)]);case 1:return[2,h(n.sent())]}}))}))}function k(t,r){var i;return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return e.trys.push([0,3,,4]),(null===(i=null==t?void 0:t.contentDocument)||void 0===i?void 0:i.body)?[4,I(t.contentDocument.body,r,!0)]:[3,2];case 1:return[2,e.sent()];case 2:return[3,4];case 3:return e.sent(),[3,4];case 4:return[2,t.cloneNode(!1)]}}))}))}var L=function(t){return null!=t.tagName&&"SVG"===t.tagName.toUpperCase()};function N(t,e,n){return p(e,Element)&&(function(t,e,n){var r=e.style;if(r){var i=window.getComputedStyle(t);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):c(n).forEach((function(n){var o=i.getPropertyValue(n);if("font-size"===n&&o.endsWith("px")){var u=Math.floor(parseFloat(o.substring(0,o.length-2)))-.1;o="".concat(u,"px")}p(t,HTMLIFrameElement)&&"display"===n&&"inline"===o&&(o="block"),"d"===n&&e.getAttribute("d")&&(o="path(".concat(e.getAttribute("d"),")")),r.setProperty(n,o,i.getPropertyPriority(n))}))}}(t,e,n),function(t,e,n){m(t,e,":before",n),m(t,e,":after",n)}(t,e,n),function(t,e){p(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),p(t,HTMLInputElement)&&e.setAttribute("value",t.value)}(t,e),function(t,e){if(p(t,HTMLSelectElement)){var n=e,r=Array.from(n.children).find((function(e){return t.value===e.getAttribute("value")}));r&&r.setAttribute("selected","")}}(t,e)),e}function I(t,r,i){return e(this,void 0,void 0,(function(){return n(this,(function(u){return i||!r.filter||r.filter(t)?[2,Promise.resolve(t).then((function(t){return function(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){return p(t,HTMLCanvasElement)?[2,T(t)]:p(t,HTMLVideoElement)?[2,A(t,r)]:p(t,HTMLIFrameElement)?[2,k(t,r)]:[2,t.cloneNode(L(t))]}))}))}(t,r)})).then((function(i){return function(t,r,i){var u,c;return e(this,void 0,void 0,(function(){var e;return n(this,(function(n){switch(n.label){case 0:return L(r)?[2,r]:(e=[],0===(e=null!=(a=t).tagName&&"SLOT"===a.tagName.toUpperCase()&&t.assignedNodes?o(t.assignedNodes()):p(t,HTMLIFrameElement)&&(null===(u=t.contentDocument)||void 0===u?void 0:u.body)?o(t.contentDocument.body.childNodes):o((null!==(c=t.shadowRoot)&&void 0!==c?c:t).childNodes)).length||p(t,HTMLVideoElement)?[2,r]:[4,e.reduce((function(t,e){return t.then((function(){return I(e,i)})).then((function(t){t&&r.appendChild(t)}))}),Promise.resolve())]);case 1:return n.sent(),[2,r]}var a}))}))}(t,i,r)})).then((function(e){return N(t,e,r)})).then((function(t){return function(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u,c,a,s,l,f,h,d,v,p;return n(this,(function(n){switch(n.label){case 0:if(0===(e=t.querySelectorAll?t.querySelectorAll("use"):[]).length)return[2,t];i={},p=0,n.label=1;case 1:return p<e.length?(o=e[p],(u=o.getAttribute("xlink:href"))?(c=t.querySelector(u),a=document.querySelector(u),c||!a||i[u]?[3,3]:(s=i,l=u,[4,I(a,r,!0)])):[3,3]):[3,4];case 2:s[l]=n.sent(),n.label=3;case 3:return p++,[3,1];case 4:if((f=Object.values(i)).length){for(h="http://www.w3.org/1999/xhtml",(d=document.createElementNS(h,"svg")).setAttribute("xmlns",h),d.style.position="absolute",d.style.width="0",d.style.height="0",d.style.overflow="hidden",d.style.display="none",v=document.createElementNS(h,"defs"),d.appendChild(v),p=0;p<f.length;p++)v.appendChild(f[p]);t.appendChild(d)}return[2,t]}}))}))}(t,r)}))]:[2,null]}))}))}var D=/url\((['"]?)([^'"]+?)\1\)/g,H=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,M=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function F(t,r,i,o,u){return e(this,void 0,void 0,(function(){var e,c,a,s;return n(this,(function(n){switch(n.label){case 0:return n.trys.push([0,5,,6]),e=i?function(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;var n=document.implementation.createHTMLDocument(),r=n.createElement("base"),i=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(i),e&&(r.href=e),i.href=t,i.href}(r,i):r,c=S(r),a=void 0,u?[4,u(e)]:[3,2];case 1:return s=n.sent(),a=x(s,c),[3,4];case 2:return[4,R(e,c,o)];case 3:a=n.sent(),n.label=4;case 4:return[2,t.replace((l=r,f=l.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1"),new RegExp("(url\\(['\"]?)(".concat(f,")(['\"]?\\))"),"g")),"$1".concat(a,"$3"))];case 5:return n.sent(),[3,6];case 6:return[2,t]}var l,f}))}))}function V(t){return-1!==t.search(D)}function q(t,r,i){return e(this,void 0,void 0,(function(){var e,o;return n(this,(function(n){return V(t)?(e=function(t,e){var n=e.preferredFontFormat;return n?t.replace(M,(function(t){for(;;){var e=H.exec(t)||[],r=e[0],i=e[2];if(!i)return"";if(i===n)return"src: ".concat(r,";")}})):t}(t,i),o=function(t){var e=[];return t.replace(D,(function(t,n,r){return e.push(r),t})),e.filter((function(t){return!E(t)}))}(e),[2,o.reduce((function(t,e){return t.then((function(t){return F(t,e,r,i)}))}),Promise.resolve(e))]):[2,t]}))}))}function U(t,r,i){var o;return e(this,void 0,void 0,(function(){var e,u;return n(this,(function(n){switch(n.label){case 0:return(e=null===(o=r.style)||void 0===o?void 0:o.getPropertyValue(t))?[4,q(e,null,i)]:[3,2];case 1:return u=n.sent(),r.style.setProperty(t,u,r.style.getPropertyPriority(t)),[2,!0];case 2:return[2,!1]}}))}))}function j(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return[4,U("background",t,r)];case 1:return n.sent()?[3,3]:[4,U("background-image",t,r)];case 2:n.sent(),n.label=3;case 3:return[4,U("mask",t,r)];case 4:return(i=n.sent())?[3,6]:[4,U("-webkit-mask",t,r)];case 5:i=n.sent(),n.label=6;case 6:return(e=i)?[3,8]:[4,U("mask-image",t,r)];case 7:e=n.sent(),n.label=8;case 8:return e?[3,10]:[4,U("-webkit-mask-image",t,r)];case 9:n.sent(),n.label=10;case 10:return[2]}}))}))}function O(t,r){return e(this,void 0,void 0,(function(){var e,i,o;return n(this,(function(n){switch(n.label){case 0:return(e=p(t,HTMLImageElement))&&!E(t.src)||p(t,SVGImageElement)&&!E(t.href.baseVal)?[4,R(i=e?t.src:t.href.baseVal,S(i),r)]:[2];case 1:return o=n.sent(),[4,new Promise((function(n,i){t.onload=n,t.onerror=r.onImageErrorHandler?function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];try{n(r.onImageErrorHandler.apply(r,t))}catch(t){i(t)}}:i;var u=t;u.decode&&(u.decode=n),"lazy"===u.loading&&(u.loading="eager"),e?(t.srcset="",t.src=o):t.href.baseVal=o}))];case 2:return n.sent(),[2]}}))}))}function B(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return e=o(t.childNodes),i=e.map((function(t){return z(t,r)})),[4,Promise.all(i).then((function(){return t}))];case 1:return n.sent(),[2]}}))}))}function z(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return p(t,Element)?[4,j(t,r)]:[3,4];case 1:return e.sent(),[4,O(t,r)];case 2:return e.sent(),[4,B(t,r)];case 3:e.sent(),e.label=4;case 4:return[2]}}))}))}var W={};function $(t){return e(this,void 0,void 0,(function(){var e,r;return n(this,(function(n){switch(n.label){case 0:return null!=(e=W[t])?[2,e]:[4,fetch(t)];case 1:return[4,n.sent().text()];case 2:return r=n.sent(),e={url:t,cssText:r},W[t]=e,[2,e]}}))}))}function G(t,r){return e(this,void 0,void 0,(function(){var i,o,u,c,a=this;return n(this,(function(s){return i=t.cssText,o=/url\(["']?([^"')]+)["']?\)/g,u=i.match(/url\([^)]+\)/g)||[],c=u.map((function(u){return e(a,void 0,void 0,(function(){var e;return n(this,(function(n){return(e=u.replace(o,"$1")).startsWith("https://")||(e=new URL(e,t.url).href),[2,C(e,r.fetchRequestInit,(function(t){var e=t.result;return i=i.replace(u,"url(".concat(e,")")),[u,e]}))]}))}))})),[2,Promise.all(c).then((function(){return i}))]}))}))}function _(t){if(null==t)return[];for(var e=[],n=t.replace(/(\/\*[\s\S]*?\*\/)/gi,""),r=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");;){if(null===(u=r.exec(n)))break;e.push(u[0])}n=n.replace(r,"");for(var i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");;){var u;if(null===(u=i.exec(n))){if(null===(u=o.exec(n)))break;i.lastIndex=o.lastIndex}else o.lastIndex=i.lastIndex;e.push(u[0])}return e}function J(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){return e=[],i=[],t.forEach((function(e){if("cssRules"in e)try{o(e.cssRules||[]).forEach((function(t,n){if(t.type===CSSRule.IMPORT_RULE){var o=n+1,u=$(t.href).then((function(t){return G(t,r)})).then((function(t){return _(t).forEach((function(t){try{e.insertRule(t,t.startsWith("@import")?o+=1:e.cssRules.length)}catch(e){console.error("Error inserting rule from remote css",{rule:t,error:e})}}))})).catch((function(t){console.error("Error loading remote css",t.toString())}));i.push(u)}}))}catch(o){var n=t.find((function(t){return null==t.href}))||document.styleSheets[0];null!=e.href&&i.push($(e.href).then((function(t){return G(t,r)})).then((function(t){return _(t).forEach((function(t){n.insertRule(t,n.cssRules.length)}))})).catch((function(t){console.error("Error loading remote stylesheet",t)}))),console.error("Error inlining remote css file",o)}})),[2,Promise.all(i).then((function(){return t.forEach((function(t){if("cssRules"in t)try{o(t.cssRules||[]).forEach((function(t){e.push(t)}))}catch(e){console.error("Error while reading CSS rules from ".concat(t.href),e)}})),e}))]}))}))}function Q(t){return t.filter((function(t){return t.type===CSSRule.FONT_FACE_RULE})).filter((function(t){return V(t.style.getPropertyValue("src"))}))}function X(t,r){return e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:if(null==t.ownerDocument)throw new Error("Provided element is not within a Document");return[4,J(o(t.ownerDocument.styleSheets),r)];case 1:return[2,Q(e.sent())]}}))}))}function K(t){return t.trim().replace(/["']/g,"")}function Y(t,r){return e(this,void 0,void 0,(function(){var e,i;return n(this,(function(n){switch(n.label){case 0:return[4,X(t,r)];case 1:return e=n.sent(),i=function(t){var e=new Set;return function t(n){(n.style.fontFamily||getComputedStyle(n).fontFamily).split(",").forEach((function(t){e.add(K(t))})),Array.from(n.children).forEach((function(e){e instanceof HTMLElement&&t(e)}))}(t),e}(t),[4,Promise.all(e.filter((function(t){return i.has(K(t.style.fontFamily))})).map((function(t){var e=t.parentStyleSheet?t.parentStyleSheet.href:null;return q(t.cssText,e,r)})))];case 2:return[2,n.sent().join("\n")]}}))}))}function Z(t,r){return e(this,void 0,void 0,(function(){var e,i,o,u,c;return n(this,(function(n){switch(n.label){case 0:return null==r.fontEmbedCSS?[3,1]:(i=r.fontEmbedCSS,[3,5]);case 1:return r.skipFonts?(o=null,[3,4]):[3,2];case 2:return[4,Y(t,r)];case 3:o=n.sent(),n.label=4;case 4:i=o,n.label=5;case 5:return(e=i)&&(u=document.createElement("style"),c=document.createTextNode(e),u.appendChild(c),t.firstChild?t.insertBefore(u,t.firstChild):t.appendChild(u)),[2]}}))}))}function tt(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,I(t,r,!0)];case 1:return[4,Z(u=n.sent(),r)];case 2:return n.sent(),[4,z(u,r)];case 3:return n.sent(),function(t,e){var n=t.style;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width="".concat(e.width,"px")),e.height&&(n.height="".concat(e.height,"px"));var r=e.style;null!=r&&Object.keys(r).forEach((function(t){n[t]=r[t]}))}(u,r),[4,v(u,i,o)];case 4:return[2,n.sent()]}}))}))}function et(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u,c,a,f,d,v;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,tt(t,r)];case 1:return[4,h(n.sent())];case 2:return u=n.sent(),c=document.createElement("canvas"),a=c.getContext("2d"),f=r.pixelRatio||function(){var t,e;try{e=process}catch(t){}var n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}(),d=r.canvasWidth||i,v=r.canvasHeight||o,c.width=d*f,c.height=v*f,r.skipAutoScale||function(t){(t.width>l||t.height>l)&&(t.width>l&&t.height>l?t.width>t.height?(t.height*=l/t.width,t.width=l):(t.width*=l/t.height,t.height=l):t.width>l?(t.height*=l/t.width,t.width=l):(t.width*=l/t.height,t.height=l))}(c),c.style.width="".concat(d),c.style.height="".concat(v),r.backgroundColor&&(a.fillStyle=r.backgroundColor,a.fillRect(0,0,c.width,c.height)),a.drawImage(u,0,0,c.width,c.height),[2,c]}}))}))}t.getFontEmbedCSS=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){return[2,Y(t,r)]}))}))},t.toBlob=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[4,f(e.sent())];case 2:return[2,e.sent()]}}))}))},t.toCanvas=et,t.toJpeg=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[2,e.sent().toDataURL("image/jpeg",r.quality||1)]}}))}))},t.toPixelData=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){var e,i,o,u;return n(this,(function(n){switch(n.label){case 0:return e=s(t,r),i=e.width,o=e.height,[4,et(t,r)];case 1:return u=n.sent(),[2,u.getContext("2d").getImageData(0,0,i,o).data]}}))}))},t.toPng=function(t,r){return void 0===r&&(r={}),e(this,void 0,void 0,(function(){return n(this,(function(e){switch(e.label){case 0:return[4,et(t,r)];case 1:return[2,e.sent().toDataURL()]}}))}))},t.toSvg=tt}));
//# sourceMappingURL=html-to-image.js.map

/* Aroma Hub notes — "leave a comment" for project rooms.
   The mascot gets a button. Pressing it freezes what the visitor sees into a picture, lets them drop numbered
   marks on it and write a note on each, then sends the lot to the hub (window.AROMA_NOTES.endpoint).
   With no endpoint it runs in trial mode: nothing leaves the browser, the visitor can download the result.

   Page setup, before this file:
     window.AROMA_NOTES = { room: 'egymap',            // project id on the hub
                            endpoint: '',              // where comments are posted; empty = trial mode
                            top: '2px', left: '36.5%', // where the mascot and his button sit
                            arabic: function(){...},   // optional: is the page in Arabic right now
                            ready: function(){...},    // optional: false until the page has finished starting up
                            hidden: function(){...},   // optional: true while he must stay out of the way
                            context: function(){...} } // optional: small object describing what is on screen
   Needs htmlToImage (bundled above this code). Works without the mascot too: the button then stands alone. */
(function(){
  'use strict';
  if(window.AromaNotes) return;
  var C=window.AROMA_NOTES||{}, D=document, W=window, H2I=W.htmlToImage;
  var SMALL=W.innerWidth<760, SIZE=SMALL?76:(C.size||136);
  var TXT={
    ar:{btn:'سيب تعليق', hi:'عندك ملاحظة؟ دوس هنا وأنا أثبّتلك اللقطة.', snap:'ثبّتّ اللقطة. علّم على المكان اللي تقصده.', dev:'بجهّز اللقطة كاملة…', title:'تعليق على اللقطة',
        hint:'اضغط على أي مكان في الصورة عشان تحط علامة، واكتب ملاحظتك عليها.', general:'ملاحظة عامة', generalPh:'أي كلام عام عن اللقطة دي (اختياري)…', name:'الاسم', namePh:'اسمك',
        ph:'اكتب ملاحظتك على العلامة دي…', send:'ابعت التعليق', cancel:'إلغاء', del:'امسح العلامة', empty:'اكتب ملاحظة واحدة على الأقل قبل الإرسال.', needName:'اكتب اسمك عشان نعرف التعليق من مين.',
        sending:'ببعت…', sent:'وصلت. شكرًا، هنراجعها.', sentBub:'وصلت. شكرًا.', fail:'التعليق ما اتبعتش. جرّب تاني.', test:'وضع تجربة: التعليق ما اتبعتش لحد. دي الصورة اللي هتوصل.', dl:'نزّل الصورة', close:'تمام', marks:'العلامات', none:'لسه مفيش علامات.'},
    en:{btn:'Leave a comment', hi:'Got a note? Press here and I will freeze the frame.', snap:'Frame frozen. Mark the spot you mean.', dev:'Developing the full frame…', title:'Comment on this frame',
        hint:'Click anywhere on the picture to drop a mark, then write your note on it.', general:'General note', generalPh:'Anything about this frame as a whole (optional)…', name:'Name', namePh:'Your name',
        ph:'Write your note for this mark…', send:'Send comment', cancel:'Cancel', del:'Remove mark', empty:'Write at least one note before sending.', needName:'Add your name so we know who this is from.',
        sending:'Sending…', sent:'Received. Thank you, we will review it.', sentBub:'Got it. Thanks.', fail:'The comment was not sent. Please try again.', test:'Trial mode: this comment was not sent to anyone. This is the picture that would arrive.', dl:'Download picture', close:'Done', marks:'Marks', none:'No marks yet.'}
  };
  function isAr(){ try{ if(typeof C.arabic==='function') return !!C.arabic(); }catch(e){} return (D.documentElement.dir||'')==='rtl'||/^ar/i.test(D.documentElement.lang||''); }
  function L(){ return isAr()?TXT.ar:TXT.en; }
  function el(tag,cls,txt){ var e=D.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
  function mood(m){ try{ W.AromaMascot&&W.AromaMascot.say('',m); }catch(e){} }

  /* ---------- styles ---------- */
  var css='#an-root{--an-cream:#f3ece6;--an-ink:#180703;--an-red:#e2300f;--an-or:#ef6a3c;--an-teal:#4fb3b0;--an-bg:#12100e;--an-line:rgba(243,236,230,.16);font-family:var(--f-body,"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif);font-size:15px;line-height:1.5;color:var(--an-cream)}'
  +'#an-root *{box-sizing:border-box}'
  +'#an-root .an-dock{position:fixed;z-index:2147483000;display:flex;align-items:center;gap:2px;direction:ltr;pointer-events:none;transition:opacity .3s,transform .3s}'
  +'#an-root .an-dock.an-off{opacity:0;transform:translateY(-12px);visibility:hidden}'
  +'#an-root .an-slot{position:relative;flex:none;pointer-events:auto;cursor:pointer}'
  +'#an-root .an-col{display:flex;flex-direction:column;align-items:flex-start;gap:6px;pointer-events:none}'
  +'#an-root .an-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:9px 16px 9px 14px;background:var(--an-cream);color:var(--an-ink);font:600 15px/1.2 var(--f-body,"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif);border:0;cursor:pointer;clip-path:polygon(0 0,100% 0,100% 100%,11px 100%,0 calc(100% - 11px));transition:background .2s,transform .2s;white-space:nowrap}'
  +'#an-root .an-btn:hover{background:#fff;transform:translateY(-1px)}#an-root .an-btn:active{transform:translateY(1px)}'
  +'#an-root .an-btn:focus-visible,#an-root .an-x:focus-visible,#an-root .an-go:focus-visible,#an-root .an-no:focus-visible{outline:2px solid var(--an-or);outline-offset:3px}'
  +'#an-root .an-btn svg{flex:none}'
  +'#an-root .an-bub{max-width:250px;background:rgba(18,16,14,.92);color:var(--an-cream);border-inline-start:3px solid var(--an-or);padding:7px 11px;font-size:13.5px;line-height:1.45;opacity:0;transform:translateY(-4px);transition:opacity .25s,transform .25s}'
  +'#an-root .an-bub.an-on{opacity:1;transform:none}'
  +'#an-root .an-modal{position:fixed;inset:0;z-index:2147483200;background:rgba(10,8,7,.9);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;gap:18px;padding:18px;align-items:stretch}'
  +'#an-root .an-modal[hidden]{display:none}'
  +'#an-root .an-stage{flex:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;position:relative}'
  +'#an-root .an-pic{position:relative;max-width:100%;max-height:100%;cursor:crosshair;box-shadow:0 0 0 1px var(--an-line),0 24px 80px rgba(0,0,0,.6);touch-action:manipulation}'
  +'#an-root .an-pic img{display:block;width:100%;height:100%;-webkit-user-drag:none;user-select:none;-webkit-user-select:none}'
  +'#an-root .an-dev{position:absolute;inset-inline-start:10px;top:10px;background:rgba(18,16,14,.88);padding:5px 10px;font-size:12.5px;color:var(--an-teal);pointer-events:none}'
  +'#an-root .an-pin{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:var(--an-red);color:#fff;font:700 15px/34px var(--f-num,ui-monospace,Menlo,Consolas,monospace);text-align:center;box-shadow:0 0 0 3px #fff,0 4px 14px rgba(0,0,0,.55);pointer-events:none;animation:an-pop .28s cubic-bezier(.2,1.5,.4,1)}'
  +'#an-root .an-pin.an-hot{background:var(--an-or);box-shadow:0 0 0 3px #fff,0 0 0 8px rgba(239,106,60,.4)}'
  +'@keyframes an-pop{from{transform:scale(.55)}to{transform:none}}'
  +'#an-root .an-side{flex:none;width:min(360px,34vw);display:flex;flex-direction:column;gap:12px;background:var(--an-bg);border:1px solid var(--an-line);padding:16px;min-height:0}'
  +'#an-root .an-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px}'
  +'#an-root .an-h b{font:700 18px/1.3 var(--f-head,inherit)}#an-root .an-h span{font-size:12px;color:var(--an-teal);letter-spacing:.08em}'
  +'#an-root .an-hint{font-size:13px;color:rgba(243,236,230,.72);margin:0}'
  +'#an-root .an-list{flex:1;min-height:60px;overflow:auto;display:flex;flex-direction:column;gap:10px;padding-inline-end:2px}'
  +'#an-root .an-none{font-size:13px;color:rgba(243,236,230,.5);border:1px dashed var(--an-line);padding:14px;text-align:center}'
  +'#an-root .an-row{display:grid;grid-template-columns:30px 1fr 30px;gap:8px;align-items:start}'
  +'#an-root .an-n{width:30px;height:30px;border-radius:50%;background:var(--an-red);color:#fff;font:700 14px/30px var(--f-num,ui-monospace,Menlo,monospace);text-align:center}'
  +'#an-root textarea,#an-root input{width:100%;background:rgba(243,236,230,.06);color:var(--an-cream);border:1px solid var(--an-line);padding:9px 10px;font:inherit;font-size:14.5px;border-radius:0;resize:vertical;outline:none}'
  +'#an-root textarea:focus,#an-root input:focus{border-color:var(--an-or);background:rgba(243,236,230,.1)}'
  +'#an-root textarea::placeholder,#an-root input::placeholder{color:rgba(243,236,230,.4)}'
  +'#an-root .an-x{width:30px;height:30px;background:none;border:1px solid var(--an-line);color:var(--an-cream);font:400 18px/1 sans-serif;cursor:pointer}'
  +'#an-root .an-x:hover{border-color:var(--an-red);color:var(--an-red)}'
  +'#an-root label{display:block;font-size:12px;letter-spacing:.04em;color:rgba(243,236,230,.6);margin-bottom:4px}'
  +'#an-root .an-msg{min-height:20px;font-size:13px;color:var(--an-or);margin:0}'
  +'#an-root .an-acts{display:flex;gap:10px}'
  +'#an-root .an-go{flex:1;min-height:48px;background:var(--an-red);color:#fff;border:0;font:700 16px/1.2 inherit;font-family:inherit;cursor:pointer;clip-path:polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))}'
  +'#an-root .an-go:hover{background:var(--an-or)}#an-root .an-go[disabled]{opacity:.6;cursor:default}'
  +'#an-root .an-no{min-height:48px;padding:0 18px;background:none;color:var(--an-cream);border:1px solid var(--an-line);font:inherit;cursor:pointer}'
  +'#an-root .an-no:hover{border-color:var(--an-cream)}'
  +'#an-root .an-done{display:flex;flex-direction:column;gap:14px;flex:1;min-height:0}'
  +'#an-root .an-done .an-go{flex:none}#an-root .an-sum{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;overflow:auto;font-size:14px}#an-root .an-sum li{display:grid;grid-template-columns:26px 1fr;gap:8px;align-items:start}#an-root .an-sum .an-n{width:26px;height:26px;line-height:26px;font-size:12.5px}'
  +'#an-root .an-done p{margin:0}#an-root .an-done .an-big{font:700 19px/1.4 var(--f-head,inherit)}'
  +'#an-root .an-done a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border:1px solid var(--an-line);color:var(--an-cream);text-decoration:none}'
  +'#an-root .an-done a:hover{border-color:var(--an-cream)}'
  +'@media (max-width:820px){#an-root .an-modal{flex-direction:column;padding:10px;gap:10px}#an-root .an-side{width:auto;max-height:52vh}#an-root .an-stage{min-height:34vh}#an-root .an-bub{display:none}#an-root .an-btn{padding:8px 12px;font-size:14px}}'
  +'@media (prefers-reduced-motion:reduce){#an-root .an-pin{animation:none}#an-root .an-dock,#an-root .an-bub,#an-root .an-btn{transition:none}}';
  var st=el('style'); st.textContent=css; D.head.appendChild(st);

  /* ---------- dock: mascot + button ---------- */
  var root=el('div'); root.id='an-root';
  var dock=el('div','an-dock'); dock.style.top=SMALL?'52px':(C.top||'8px'); dock.style.left=SMALL?'6px':(C.left||'8px');
  var slot=el('div','an-slot'); slot.style.width=SIZE+'px'; slot.style.height=SIZE+'px'; slot.style.display='none';
  var col=el('div','an-col');
  var btn=el('button','an-btn'); btn.type='button';
  var bub=el('div','an-bub'); bub.setAttribute('role','status');
  col.appendChild(btn); col.appendChild(bub); dock.appendChild(slot); dock.appendChild(col); root.appendChild(dock);
  var ICON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M12 8.5v7M8.5 12h7"/></svg>';
  function paintBtn(){ var t=L(); btn.innerHTML=ICON+'<span></span>'; btn.lastChild.textContent=t.btn; btn.dir=isAr()?'rtl':'ltr'; bub.dir=isAr()?'rtl':'ltr'; }
  var bubT=0;
  function say(t,m,ms){ if(m) mood(m); if(!t){ bub.classList.remove('an-on'); return; } bub.textContent=t; bub.dir=isAr()?'rtl':'ltr'; bub.classList.add('an-on'); clearTimeout(bubT); bubT=setTimeout(function(){ bub.classList.remove('an-on'); },ms||4200); }

  /* adopt the hub mascot when he shows up: he moves next to the button, his own bubble stays quiet */
  var mascot=null, tries=0;
  function adopt(){
    var k=D.body.children, i, e;
    for(i=0;i<k.length;i++){ e=k[i]; if(e.tagName==='DIV'&&e.getAttribute('aria-hidden')==='true'&&String(e.style.zIndex)==='2147483000'&&e.querySelector('canvas')){ mascot=e; break; } }
    if(!mascot){ if(++tries<60) setTimeout(adopt,150); return; }
    if(mascot.firstChild&&mascot.firstChild.tagName==='DIV') mascot.firstChild.style.display='none';
    mascot.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    slot.appendChild(mascot); slot.style.display='';
  }

  /* ---------- capture ---------- */
  function visible(cv){ if(root.contains(cv)) return false; var r=cv.getBoundingClientRect(); if(r.width<2||r.height<2||!cv.width||!cv.height) return false; if(r.right<0||r.bottom<0||r.left>W.innerWidth||r.top>W.innerHeight) return false; var s=getComputedStyle(cv); return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>.02; }
  /* must run inside requestAnimationFrame: a WebGL canvas only holds its picture until the frame is shown */
  function grabCanvases(){
    var out=[]; [].forEach.call(D.querySelectorAll('canvas'),function(cv){
      if(!visible(cv)) return;
      try{ var c=D.createElement('canvas'); c.width=cv.width; c.height=cv.height; c.getContext('2d').drawImage(cv,0,0); out.push({cv:cv,copy:c,rect:cv.getBoundingClientRect()}); }catch(e){}
    }); return out;
  }
  function quick(shots,pr){ var c=D.createElement('canvas'); c.width=Math.round(W.innerWidth*pr); c.height=Math.round(W.innerHeight*pr); var x=c.getContext('2d'); x.fillStyle=getComputedStyle(D.body).backgroundColor||'#000'; x.fillRect(0,0,c.width,c.height);
    shots.forEach(function(s){ try{ x.drawImage(s.copy,s.rect.left*pr,s.rect.top*pr,s.rect.width*pr,s.rect.height*pr); }catch(e){} }); return c; }
  var fontCss=null;
  /* The page copier styles every HTML element but copies drawings (svg) as they are, so anything a drawing gets from the
     style sheet (line colour, width, dashes) would be lost. Just for the copy, write those values onto the shapes themselves. */
  var SVGP=['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin','stroke-miterlimit','opacity','visibility','display','color','font-family','font-size','font-weight','letter-spacing','text-anchor','dominant-baseline','paint-order','vector-effect','mix-blend-mode','filter','clip-path','mask','transform','transform-origin','transform-box'];
  function pinSvg(){
    var undo=[];
    [].forEach.call(D.querySelectorAll('svg'),function(svg){
      if(root.contains(svg)||!svg.getClientRects().length) return;
      [].forEach.call(svg.querySelectorAll('*'),function(n){
        if(!n.style||n.tagName==='style'||n.tagName==='defs') return; var cs=getComputedStyle(n), had=n.hasAttribute('style'), set=[], i, p, v;
        for(i=0;i<SVGP.length;i++){ p=SVGP[i]; if(n.style.getPropertyValue(p)) continue; v=cs.getPropertyValue(p); if(v){ n.style.setProperty(p,v); set.push(p); } }
        if(set.length) undo.push([n,set,had]);
      });
    });
    return function(){ undo.forEach(function(u){ u[1].forEach(function(p){ u[0].style.removeProperty(p); }); if(!u[2]&&!u[0].getAttribute('style')) u[0].removeAttribute('style'); }); undo=[]; };
  }
  function full(shots,pr){
    if(!H2I) return Promise.reject(new Error('no htmlToImage'));
    /* while the page is copied, each canvas answers with the picture grabbed above instead of an empty one */
    shots.forEach(function(s){ var u=null; s.cv.toDataURL=function(){ if(!u){ try{ var gl=s.cv.getContext('webgl2')||s.cv.getContext('webgl'); var opaque=gl&&gl.getContextAttributes&&gl.getContextAttributes().alpha===false; u=opaque?s.copy.toDataURL('image/jpeg',.93):s.copy.toDataURL('image/png'); }catch(e){ u=s.copy.toDataURL('image/png'); } } return u; }; });
    var unpin=function(){};
    function restore(){ shots.forEach(function(s){ try{ delete s.cv.toDataURL; }catch(e){} }); try{ unpin(); }catch(e){} }
    var fonts=fontCss!=null?Promise.resolve(fontCss):H2I.getFontEmbedCSS(D.body).then(function(c){ fontCss=c||''; return fontCss; },function(){ fontCss=''; return ''; });
    function keep(n){ if(n===root||n===mascot) return false; if(n.nodeType!==1) return true; var tg=n.tagName; if(tg==='SCRIPT'||tg==='NOSCRIPT') return false; if(n===D.body) return true;
      if(n.hidden) return false; var cs=getComputedStyle(n); return !(cs.display==='none'||cs.opacity==='0'); }
    var job=fonts.then(function(fc){ unpin=pinSvg(); return H2I.toSvg(D.body,{width:W.innerWidth,height:W.innerHeight,fontEmbedCSS:fc,cacheBust:false,filter:keep}); }).then(function(url){ unpin();
      /* the copy carries every element's look as it is this instant; without this its animations would start over from frame one */
      var svg=decodeURIComponent(url.slice(url.indexOf(',')+1)), k=svg.indexOf('>',svg.indexOf('<foreignObject'))+1;
      svg=svg.slice(0,k)+'<style xmlns="http://www.w3.org/1999/xhtml">*,*::before,*::after{animation:none!important;transition:none!important}</style>'+svg.slice(k);
      return new Promise(function(res,rej){ var im=new Image(); im.onload=function(){ var c=D.createElement('canvas'); c.width=Math.round(W.innerWidth*pr); c.height=Math.round(W.innerHeight*pr); var x=c.getContext('2d');
        x.fillStyle=getComputedStyle(D.body).backgroundColor||'#000'; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); res(c); }; im.onerror=function(){ rej(new Error('svg')); }; im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); });
    });
    var timer=new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); },25000); });
    return Promise.race([job,timer]).then(function(c){ restore(); return c; },function(e){ restore(); throw e; });
  }
  function blank(c){ try{ var x=c.getContext('2d'), w=c.width, h=c.height, d, i, n=0, s=0; for(var k=0;k<12;k++){ d=x.getImageData(Math.floor(w*(.1+.07*k)),Math.floor(h*(.2+.05*k)),8,8).data; for(i=0;i<d.length;i+=4){ s+=d[i]+d[i+1]+d[i+2]; n++; } } return s/n<6; }catch(e){ return false; } }

  /* ---------- the comment sheet ---------- */
  var modal=el('div','an-modal'); modal.hidden=true; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); root.appendChild(modal);
  ['keydown','keyup','keypress','wheel','pointerdown','pointerup','pointermove','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','contextmenu'].forEach(function(t){ modal.addEventListener(t,function(e){ e.stopPropagation(); if(t==='keydown'&&e.key==='Escape'&&!busy) close(); }); });
  var S=null, busy=false;
  function close(){ modal.hidden=true; modal.textContent=''; if(S&&S.url) URL.revokeObjectURL(S.url); S=null; dock.classList.remove('an-off'); sync(); }
  function setPic(canvas){ if(!S) return; S.canvas=canvas; canvas.toBlob(function(b){ if(!S||!b) return; if(S.url) URL.revokeObjectURL(S.url); S.url=URL.createObjectURL(b); S.img.src=S.url; },'image/jpeg',.92); }
  function fit(){ if(!S) return; var a=S.w/S.h, bw=S.stage.clientWidth, bh=S.stage.clientHeight; if(!bw||!bh) return; var w=Math.min(bw,bh*a); S.pic.style.width=Math.floor(w)+'px'; S.pic.style.height=Math.floor(w/a)+'px'; }
  function open(shots,pr){
    var t=L(), rtl=isAr();
    S={pins:[],w:W.innerWidth,h:W.innerHeight,pr:pr,when:new Date().toISOString(),ctx:null};
    try{ if(typeof C.context==='function') S.ctx=C.context(); }catch(e){}
    modal.dir=rtl?'rtl':'ltr'; modal.textContent='';
    var stage=el('div','an-stage'), pic=el('div','an-pic'), img=el('img'), dev=el('div','an-dev',t.dev); img.alt=''; img.draggable=false; pic.appendChild(img); pic.appendChild(dev); stage.appendChild(pic);
    var side=el('div','an-side'), h=el('div','an-h'); h.appendChild(el('b',null,t.title)); h.appendChild(el('span',null,'AROMA HUB'));
    var hint=el('p','an-hint',t.hint), list=el('div','an-list'), none=el('div','an-none',t.none); list.appendChild(none);
    var gw=el('div'), gl=el('label',null,t.general), ga=el('textarea'); ga.rows=2; ga.placeholder=t.generalPh; gl.htmlFor='an-general'; ga.id='an-general'; gw.appendChild(gl); gw.appendChild(ga);
    var nw=el('div'), nl=el('label',null,t.name), ni=el('input'); ni.type='text'; ni.placeholder=t.namePh; ni.autocomplete='name'; ni.maxLength=80; nl.htmlFor='an-name'; ni.id='an-name'; nw.appendChild(nl); nw.appendChild(ni);
    try{ ni.value=localStorage.getItem('aroma-notes-name')||''; }catch(e){}
    var msg=el('p','an-msg'); msg.setAttribute('role','alert');
    var acts=el('div','an-acts'), go=el('button','an-go',t.send), no=el('button','an-no',t.cancel); go.type='button'; no.type='button'; acts.appendChild(go); acts.appendChild(no);
    [h,hint,list,gw,nw,msg,acts].forEach(function(x){ side.appendChild(x); });
    modal.appendChild(stage); modal.appendChild(side);
    S.stage=stage; S.pic=pic; S.img=img; S.dev=dev; S.list=list; S.none=none; S.msg=msg; S.side=side;
    function renum(){ S.pins.forEach(function(p,i){ p.dot.textContent=i+1; p.num.textContent=i+1; }); none.style.display=S.pins.length?'none':''; }
    pic.addEventListener('click',function(e){
      if(busy) return; var r=pic.getBoundingClientRect(); var p={x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};
      p.dot=el('div','an-pin'); p.dot.style.left=(p.x*100)+'%'; p.dot.style.top=(p.y*100)+'%'; pic.appendChild(p.dot);
      p.row=el('div','an-row'); p.num=el('div','an-n'); p.ta=el('textarea'); p.ta.rows=2; p.ta.placeholder=t.ph; p.ta.setAttribute('aria-label',t.ph);
      var x=el('button','an-x','×'); x.type='button'; x.title=t.del; x.setAttribute('aria-label',t.del);
      x.addEventListener('click',function(){ S.pins.splice(S.pins.indexOf(p),1); p.dot.remove(); p.row.remove(); renum(); });
      p.ta.addEventListener('focus',function(){ p.dot.classList.add('an-hot'); }); p.ta.addEventListener('blur',function(){ p.dot.classList.remove('an-hot'); });
      p.row.appendChild(p.num); p.row.appendChild(p.ta); p.row.appendChild(x); list.appendChild(p.row); S.pins.push(p); renum(); msg.textContent='';
      p.ta.focus(); list.scrollTop=list.scrollHeight; mood('happy');
    });
    no.addEventListener('click',function(){ if(!busy) close(); });
    go.addEventListener('click',function(){ send(go,ga,ni); });
    modal.hidden=false; dock.classList.add('an-off'); fit();
    setPic(quick(shots,pr));
    full(shots,pr).then(function(c){ if(!S) return; if(!blank(c)) setPic(c); dev.remove(); },function(){ if(S) dev.remove(); });
  }
  W.addEventListener('resize',fit);

  function flatten(){
    var src=S.canvas, c=D.createElement('canvas'), k=Math.min(1,2200/src.width); c.width=Math.round(src.width*k); c.height=Math.round(src.height*k);
    var x=c.getContext('2d'); x.drawImage(src,0,0,c.width,c.height);
    var r=Math.max(15,Math.round(c.width/88));
    S.pins.forEach(function(p,i){ var px=p.x*c.width, py=p.y*c.height; x.beginPath(); x.arc(px,py,r+3,0,6.2832); x.fillStyle='#fff'; x.fill(); x.beginPath(); x.arc(px,py,r,0,6.2832); x.fillStyle='#e2300f'; x.fill();
      x.fillStyle='#fff'; x.font='700 '+Math.round(r*1.15)+'px ui-monospace,Menlo,Consolas,monospace'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(i+1),px,py+1); });
    return c;
  }
  function send(go,ga,ni){
    if(busy||!S) return; var t=L(), name=ni.value.trim(), general=ga.value.trim();
    var pins=S.pins.map(function(p,i){ return {n:i+1,x:+p.x.toFixed(4),y:+p.y.toFixed(4),text:p.ta.value.trim()}; });
    if(!general&&!pins.some(function(p){ return p.text; })){ S.msg.textContent=t.empty; mood('sad'); return; }
    if(!name){ S.msg.textContent=t.needName; ni.focus(); return; }
    try{ localStorage.setItem('aroma-notes-name',name); }catch(e){}
    busy=true; go.disabled=true; go.textContent=t.sending; S.msg.textContent='';
    var flat=flatten(), meta={room:C.room||'',name:name,when:S.when,page:location.pathname,general:general,pins:pins,context:S.ctx,view:{w:S.w,h:S.h,dpr:W.devicePixelRatio||1,lang:isAr()?'ar':'en'}};
    flat.toBlob(function(blob){
      function done(ok,trial){ busy=false; if(!S) return;
        if(!ok){ go.disabled=false; go.textContent=t.send; S.msg.textContent=t.fail; mood('sad'); return; }
        var side=S.side; side.textContent=''; var d=el('div','an-done'); d.appendChild(el('p','an-big',trial?t.test:t.sent));
        if(trial){ var a=el('a',null,t.dl); a.href=URL.createObjectURL(blob); a.download='aroma-comment-'+(C.room||'room')+'.jpg'; d.appendChild(a); S.img.src=a.href; S.pins.forEach(function(p){ p.dot.remove(); }); }
        var ul=el('ul','an-sum'); pins.forEach(function(q){ if(!q.text) return; var li=el('li'); li.appendChild(el('span','an-n',String(q.n))); li.appendChild(el('span',null,q.text)); ul.appendChild(li); }); if(general){ var lg=el('li'); lg.appendChild(el('span')); lg.appendChild(el('span',null,general)); ul.appendChild(lg); } if(ul.firstChild) d.appendChild(ul);
        var ok2=el('button','an-go',t.close); ok2.type='button'; ok2.addEventListener('click',close); d.appendChild(ok2); side.appendChild(d); ok2.focus();
        setTimeout(function(){ say(t.sentBub,'happy',5000); },300);
      }
      if(!blob){ done(false); return; }
      if(!C.endpoint){ W.AromaNotes.last={meta:meta,image:blob}; done(true,true); return; }
      var fd=new FormData(); fd.append('meta',JSON.stringify(meta)); fd.append('image',blob,'frame.jpg');
      fetch(C.endpoint,{method:'POST',body:fd}).then(function(r){ done(r.ok); },function(){ done(false); });
    },'image/jpeg',.86);
  }

  /* ---------- start a comment ---------- */
  function begin(){
    if(S||busy) return; var t=L(); say(t.snap,'wow',3000);
    var pr=Math.max(1,Math.min(W.devicePixelRatio||1,2400/W.innerWidth,2));
    requestAnimationFrame(function(){ var shots=grabCanvases(); open(shots,pr); });
  }
  btn.addEventListener('click',begin); slot.addEventListener('click',begin);

  /* ---------- stay out of the way when the page says so, follow fullscreen ---------- */
  var ready=false;
  function sync(){ var off=false; try{ off=typeof C.hidden==='function'&&!!C.hidden(); }catch(e){} if(S||!ready) off=true; dock.classList.toggle('an-off',off); var a=isAr(); if(btn.dir!==(a?'rtl':'ltr')) paintBtn(); }
  function home(){ var p=D.fullscreenElement||D.webkitFullscreenElement||D.body; if(root.parentNode!==p) p.appendChild(root); }
  D.addEventListener('fullscreenchange',home); D.addEventListener('webkitfullscreenchange',home);

  D.addEventListener('click',function(){ setTimeout(sync,60); },true);
  function start(){ home(); paintBtn(); sync(); setInterval(sync,500); adopt();
    (function wait(){ var ok=true; try{ ok=typeof C.ready!=='function'||!!C.ready(); }catch(e){} if(!ok){ setTimeout(wait,250); return; } ready=true; paintBtn(); sync(); setTimeout(function(){ if(!S&&!dock.classList.contains('an-off')) say(L().hi,'happy',6500); },1800); })(); }
  W.AromaNotes={open:begin,last:null};
  if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',start); else start();
})();
