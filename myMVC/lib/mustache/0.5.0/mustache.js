(function(a){if(typeof define==="function"){define("#mustache/0.5.0/mustache",[],a)}else{window.Mustache=Mustache={};a(null,Mustache)}})(function(require, exports){exports.name="mustache-debug.js";exports.version="0.5.0-dev";exports.tags=["{{","}}"];exports.parse=m;exports.compile=e;exports.render=v;exports.clearCache=u;exports.to_html=function(z,x,y,A){var w=v(z,x,y);if(typeof A==="function"){A(w)}else{return w}};var s=Object.prototype.toString;var f=Array.isArray;var b=Array.prototype.forEach;var g=String.prototype.trim;var i;if(f){i=f}else{i=function(w){return s.call(w)==="[object Array]"}}var r;if(b){r=function(x,y,w){return b.call(x,y,w)}}else{r=function(z,A,y){for(var x=0,w=z.length;x<w;++x){A.call(y,z[x],x,z)}}}var k=/^\s*$/;function c(w){return k.test(w)}var p;if(g){p=function(w){return w==null?"":g.call(w)}}else{var n,h;if(c("\xA0")){n=/^\s+/;h=/\s+$/}else{n=/^[\s\xA0]+/;h=/[\s\xA0]+$/}p=function(w){return w==null?"":String(w).replace(n,"").replace(h,"")}}var d={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function o(w){return String(w).replace(/&(?!\w+;)|[<>"']/g,function(x){return d[x]||x})}function l(C,E,F,y){y=y||"<template>";var G=E.split("\n"),w=Math.max(F-3,0),z=Math.min(G.length,F+3),x=G.slice(w,z);var D;for(var A=0,B=x.length;A<B;++A){D=A+w+1;x[A]=(D===F?" >> ":"    ")+x[A]}C.template=E;C.line=F;C.file=y;C.message=[y+":"+F,x.join("\n"),"",C.message].join("\n");return C}function t(w,E,D){if(w==="."){return E[E.length-1]}var C=w.split(".");var A=C.length-1;var B=C[A];var F,x,z=E.length,y,G;while(z){G=E.slice(0);x=E[--z];y=0;while(y<A){x=x[C[y++]];if(x==null){break}G.push(x)}if(x&&typeof x==="object"&&B in x){F=x[B];break}}if(typeof F==="function"){F=F.call(G[G.length-1])}if(F==null){return D}return F}function j(z,w,D,y){var x="";var B=t(z,w);if(y){if(B==null||B===false||(i(B)&&B.length===0)){x+=D()}}else{if(i(B)){r(B,function(E){w.push(E);x+=D();w.pop()})}else{if(typeof B==="object"){w.push(B);x+=D();w.pop()}else{if(typeof B==="function"){var A=w[w.length-1];var C=function(E){return v(E,A)};x+=B.call(A,D(),C)||""}else{if(B){x+=D()}}}}}return x}function m(Y,A){A=A||{};var J=A.tags||exports.tags,K=J[0],F=J[J.length-1];var x=['var buffer = "";',"\nvar line = 1;","\ntry {",'\nbuffer += "'];var E=[],Z=false,W=false;var U=function(){if(Z&&!W&&!A.space){while(E.length){x.splice(E.pop(),1)}}else{E=[]}Z=false;W=false};var R=[],O,B,L;var T=function(aa){J=p(aa).split(/\s+/);B=J[0];L=J[J.length-1]};var I=function(aa){x.push('";',O,'\nvar partial = partials["'+p(aa)+'"];',"\nif (partial) {","\n  buffer += render(partial,stack[stack.length - 1],partials);","\n}",'\nbuffer += "')};var w=function(ac,aa){var ab=p(ac);if(ab===""){throw l(new Error("Section name may not be empty"),Y,H,A.file)}R.push({name:ab,inverted:aa});x.push('";',O,'\nvar name = "'+ab+'";',"\nvar callback = (function () {","\n  return function () {",'\n    var buffer = "";','\nbuffer += "')};var D=function(aa){w(aa,true)};var S=function(ab){var aa=p(ab);var ad=R.length!=0&&R[R.length-1].name;if(!ad||aa!=ad){throw l(new Error('Section named "'+aa+'" was never opened'),Y,H,A.file)}var ac=R.pop();x.push('";',"\n    return buffer;","\n  };","\n})();");if(ac.inverted){x.push("\nbuffer += renderSection(name,stack,callback,true);")}else{x.push("\nbuffer += renderSection(name,stack,callback);")}x.push('\nbuffer += "')};var V=function(aa){x.push('";',O,'\nbuffer += lookup("'+p(aa)+'",stack,"");','\nbuffer += "')};var y=function(aa){x.push('";',O,'\nbuffer += escapeHTML(lookup("'+p(aa)+'",stack,""));','\nbuffer += "')};var H=1,X,C;for(var P=0,Q=Y.length;P<Q;++P){if(Y.slice(P,P+K.length)===K){P+=K.length;X=Y.substr(P,1);O="\nline = "+H+";";B=K;L=F;Z=true;switch(X){case"!":P++;C=null;break;case"=":P++;F="="+F;C=T;break;case">":P++;C=I;break;case"#":P++;C=w;break;case"^":P++;C=D;break;case"/":P++;C=S;break;case"{":F="}"+F;case"&":P++;W=true;C=V;break;default:W=true;C=y}var z=Y.indexOf(F,P);if(z===-1){throw l(new Error('Tag "'+K+'" was not closed properly'),Y,H,A.file)}var N=Y.substring(P,z);if(C){C(N)}var M=0;while(~(M=N.indexOf("\n",M))){H++;M++}P=z+F.length-1;K=B;F=L}else{X=Y.substr(P,1);switch(X){case'"':case"\\":W=true;x.push("\\"+X);break;case"\r":break;case"\n":E.push(x.length);x.push("\\n");U();H++;break;default:if(c(X)){E.push(x.length)}else{W=true}x.push(X)}}}if(R.length!=0){throw l(new Error('Section "'+R[R.length-1].name+'" was not closed properly'),Y,H,A.file)}U();x.push('";',"\nreturn buffer;","\n} catch (e) { throw {error: e, line: line}; }");var G=x.join("").replace(/buffer \+= "";\n/g,"");if(A.debug){if(typeof console!="undefined"&&console.log){console.log(G)}else{if(typeof print==="function"){print(G)}}}return G}function q(A,y){var x="view,partials,stack,lookup,escapeHTML,renderSection,render";var w=m(A,y);var z=new Function(x,w);return function(C,D){D=D||{};var B=[C];try{return z(C,D,B,t,o,j,v)}catch(E){throw l(E.error,A,E.line,y.file)}}}var a={};function u(){a={}}function e(x,w){w=w||{};if(w.cache!==false){if(!a[x]){a[x]=q(x,w)}return a[x]}return q(x,w)}function v(y,w,x){return e(y)(w,x)}});