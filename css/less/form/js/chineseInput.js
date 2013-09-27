/**
 * 
 * 依赖zepto
 * 作者：瞿星
*/

 define(function(require,exports,module){

    var $ = require('zepto');
    var op = {
        checkInterval: 200
    }

	$.fn.chineseInput = function(fn){
        fn = fn || function(){console.log("onChineseInput");};
        return this.each(function(){
            var $this = $(this),
            timer,
            lastVal = $this.val(),
            checkInput = function(el){
                timer = setTimeout(function(){
                    checkInput(el);
                    var nowVal = el.val();
                    if (nowVal == lastVal) {
                        return
                    } else {
                        lastVal = nowVal;
                        fn.call($this,nowVal);
                    }
                },op.checkInterval);
            };
            checkInput($this);
        });
	}
    
	return null;
});
