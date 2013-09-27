/**
 * 
 * 依赖zepto
 * 作者：瞿星
*/

 define(function(require,exports,module){

    var $ = require('zepto');
    var drag = require('./drag');

    var range = function(opts) {
		var that = this;
        var op = {
            min : 0,  //整个滑动条的最小值
            max : 50, //整个滑动条的最大值
            step: 1,
            pos : 0, //小数点后几位
            onSlide: function(num) {}, //滑动中事件
            single: true,  //是否单个滑块
            highlight: "highlight", //高亮条的class
            value: 0, //初始化值,single为true时生效
            range: [10,50]  //初始范围，single为false时生效
        }
        $.extend(op,opts);


        var percent; //初始平移的距离
        var leftPercent;
        var rightPercent;
        
        var _t; //模板
        var render = function (){
            //建立模板
            if(op.single) {
                _t = '<div class="'+ op.highlight +'"></div><span class="slider-thumb"></span>';
            }else {
                _t = '<div class="'+ op.highlight +'"></div><span class="left-slider-thumb"></span><span class="right-slider-thumb"></span>';
            }
            that.html(_t);
        }
        render();

        var highlight = this.find("." + op.highlight); //高亮条

        //滑块参数
        var param = {
            ver: false,
            onDrag: function(x,y,total){
                op.value = Math.round(x/total * op.max);
                op.onSlide(op.value);
                highlight.css("width",x+"px");
            },
            onStop: function (x,y,total){
                op.value = Math.round(x/total * op.max);
            }
        }

        //初始化单个滑块
        var initSingle = function (){
            //items
            var slider = that.find("span");

            //计算上限
            var singleRightLimit = that[0].clientWidth - slider[0].offsetWidth;

            //初始化value
            if(op.value) {
                percent = op.value / op.max * singleRightLimit;
                param.startX = percent;
                param.el = slider;
                highlight.css("width",percent+"px");
            }

            param.rightLimit = singleRightLimit;

            //绑定drag事件
            var objSlider = new drag(param);
            
        }


        //初始化2个滑块
        var initRange = function (){


            var left = that.find("span.left-slider-thumb");
            var right = that.find("span.right-slider-thumb");

            var rightParam = $.extend({},param);
            var leftParam = $.extend({},param);


            rightParam.onStop = function() {};
            leftParam.onDrag = function() {
                
            };
            leftParam.onStop = function() {};

            //计算右滑块的上限
            var singleRightLimit = that[0].clientWidth - right[0].offsetWidth;

            var leftWidth = left[0].offsetWidth;
            var rightWidth = right[0].offsetWidth;


            //初始化左滑块位置
            if(op.range[0]) {
                leftPercent = op.range[0] / op.max * singleRightLimit;
                leftParam.startX = leftPercent;
                leftParam.el = left;
                highlight.css("left", (leftPercent + leftWidth) +"px");
            }

            //初始化右滑块位置
            if(op.range[1]) {
                rightPercent = op.range[1] / op.max * singleRightLimit;
                rightParam.startX = rightPercent;
                rightParam.el = right;
                highlight.css("width", (rightPercent - leftPercent - leftWidth) +"px");
            }


            //初始化后，高亮条的宽度
            var highlightWidth = highlight.width();
            var l2l = leftPercent; //左滑块到左边界的距离
            var r2l = rightPercent; //右滑块到左边界的距离

            //右滑块拖动时的事件
            rightParam.onDrag = function(x,y,total) {
                op.range[1] = Math.round(x/total * op.max);
                r2l = x;
                op.onSlide(op.range[1]);
                var highlightWidth = r2l - l2l - leftWidth;
                if(highlightWidth < 0) {
                    highlightWidth = 0;
                }
                highlight.css("width", highlightWidth + "px");
            };
            //右滑块停止时的事件
            rightParam.onStop = function(x){
                objLeft.rightLimit = x;
            };

            //左滑块拖动时的事件
            leftParam.onDrag = function(x,y,total) {
                op.range[0] = Math.round(x/total * op.range[1]);
                l2l = x;
                op.onSlide(op.range[0]);
                var highlightWidth = r2l - l2l - leftWidth;
                if(highlightWidth < 0) {
                    highlightWidth = 0;
                }
                highlight.css({
                    "width": highlightWidth + "px",
                    "left" : (x + leftWidth) + "px"
                });
            };
            //左滑块停止时的事件
            leftParam.onStop = function(x){
                objRight.leftLimit = x;
                (op.range[0] == op.max) ? left.css("z-index","10") : left.css("z-index","0");
            };

            leftParam.rightLimit = rightPercent;
            rightParam.rightLimit = singleRightLimit;
            rightParam.leftLimit = leftPercent;

            var objLeft = new drag(leftParam);
            var objRight = new drag(rightParam);
        }

        op.single ?  initSingle() : initRange();

        //副本
        var _range = {
            el: that,
            getValue: function (){
                if (op.single) {
                    return op.value;
                }else{
                    return op.range;
                };
            }
        }; 

        return _range;

	};


    $.fn.range = range;

	return range;
});
