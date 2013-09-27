/**
 * 
 * 依赖zepto
 * 作者：瞿星
*/

 define(function(require,exports,module){

    var $ = require('zepto');

    var drag = function(opts) {
        var op = {
            el : ".drag", //选择器
            hor : false,//横向是否锁定，false为可以横向拖动。 
            ver : false,//纵向是否锁定，false为可以纵向拖动。 
            startX: 0, //起始横坐标值
            startY: 0, //起始纵坐标值
            //拖动时回调函数，x为横坐标，y为纵坐标
            onDrag: function(x,y) {
                //alert(x + ":" + y);
            },
            //拖动停下时回调函数，x为横坐标，y为纵坐标
            onStop: function(x,y) {
                //alert(x + ":" + y);
            },
            //左边界，一般相对于父容器，0为最左边。对x做限制
            leftLimit: 0,
            //左边界，一般相对于父容器，0为最上边。对y做限制
            topLimit: 0,
        }
        $.extend(op,opts);
        var $this = $(op.el);
        var that = this;
        this.leftLimit = op.leftLimit;
        this.topLimit = op.topLimit;
        //右边
        this.rightLimit = op.rightLimit || ($this.parent()[0].clientWidth - $this.width());
        this.bottomLimit = op.bottomLimit || ($this.parent()[0].clientHeight - $this.height());
        console.dir(this);

        this.endX = this.endY = 0;
        
        if(op.startX){
            this.endX = op.startX;
            $this[0].style.webkitTransform =  'translate(' + (this.endX) + 'px, ' + (this.endY) + 'px)';
        }

        $this.on("touchstart",function(e){
            var _touch = event.touches[0];
            that.startX= _touch.pageX;
            that.startY= _touch.pageY;
            $this[0].target.style.webkitTransform =  'translate(' + (that.endX) + 'px, ' + (that.endY) + 'px)';
        })
        .on("touchmove",function(e){
            e.preventDefault();
            var _touch = e.targetTouches[0];
            var _target = _touch.target;
            that.curX = _touch.pageX - that.startX + that.endX; 
            that.curY = _touch.pageY - that.startY + that.endY;

            //alert(curX + ":"+ curY+"," + endX + ":"+ endY +",");


            //右边界
            if(that.curX < that.leftLimit) { that.curX = that.leftLimit; }
            //左边界
            if(that.curX > that.rightLimit){ that.curX = that.rightLimit; }
            //上边界
            if(that.curY < that.topLimit){ that.curY = that.topLimit;}
            //下边界
            if(that.curY > that.bottomLimit){ that.curY = that.bottomLimit;}

            if(!op.hor && !op.ver){
                _target.style.webkitTransform =  'translate(' + (that.curX) + 'px, ' + (that.curY) + 'px)';
            }else{
                !op.hor && (_target.style.webkitTransform =  'translateX(' + (that.curX) + 'px)');
                !op.ver && (_target.style.webkitTransform = 'translateY(' + (that.curY) + 'px)');
            }

            op.onDrag.call($this,that.curX,that.curY, that.rightLimit);
        })
        .on("touchend",function(){
            that.endX = that.curX;
            that.endY = that.curY;
            op.onStop.call($this,that.endX, that.endY, that.rightLimit);
        })
		return this;
	};

    //$.fn.drag = function(options){
	//	return this.each(function (){
	//	  drag.call(this,options);
	//	});
	//}

	return drag;
});
