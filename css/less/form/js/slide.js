/**
 * 
 * 依赖zepto
 * 作者：瞿星
*/

 define(function(require,exports,module){

    var $ = require('zepto');

    //分类列表展开
    $.fn.slideDown = function(opts) {
		var self = this;
        var op = {
            callback: function(){}, //动画结束时的回调函数
            ease: 'ease-in-out', //滑动公式
            anitime: .5 //运动时间
        }
        $.extend(op,opts);
        $(this).show();
        var _height = $(this).height(); 
        this.css("height",'0').anim({height: _height}, op.anitime, op.ease, function(){
            op.callback();
        });
		return this;
	};

    //分类列表收起
    $.fn.slideUp = function(opts) {
		var $this = $(this);
        var op = {
            callback: function(){}, //动画结束时的回调函数
            ease: 'ease-in-out', //滑动公式
            anitime: .5 //运动时间
        }
        $.extend(op,opts);
        var _height = $this.height();
        $this.css("height",_height).anim({height: '0'}, op.anitime, op.ease, function(){
            $this.hide().css("height", "");
            op.callback();
        });
		return this;
	};
    
    return $;

});
