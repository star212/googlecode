/**
 * 
 * 依赖zepto
 * 作者：瞿星
*/

 define(function(require,exports,module){

    var $ = require('zepto');
    var op = {
        callback: function(){
            //alert(1);
        },
        placeholder: true
    };

	$.search = function(el,opts){
        var self = this;
        this.el = $(el);

        $.extend(op, opts);
        
        return this.el.each(this.init);
	}
	$.extend($.search.prototype,{
		init : function(i){
            var _input = $(this).find("input[type=text],input[type=number],input[type=tel],input[type=email],input[type=url],input[type=search]");
            var _val = op.placeholder ? _input.val() : "";
            var _btn = $(this).find("button").attr("type","button");
            var keyupEvent = function(e){
                _btn[0].style.display = "block";
                !_input.val() && (_btn[0].style.display = "none"); 
            }
            
            //绑定输入框事件
            _input.on("input",keyupEvent);//android 中文情况

            _input.keyup(keyupEvent).focus(function (){
                if($(this).val() == _val){$(this).val('')};
                this.value && ( _btn[0].style.display = "block");
            }).click(function(e){
                e.stopPropagation();
            }).bind('blur',function(){
                if($(this).val() == '' ) $(this).val(_val);
            });


            $(document).click(function (){
                _btn[0].style.display = "none";
            });

            //按钮点击事件
            _btn.click(function(e){
                e.preventDefault();
                _input.val("").focus();
                _btn[0].style.display = "none";
                op.callback();
            })
        }
    });
    
    $.fn.search = function(options){
		return new $.search(this.selector,options);
	}
	return $.search;
});
