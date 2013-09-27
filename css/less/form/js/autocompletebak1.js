/**
 * 
 * 依赖zepto
*/

 define(function(require,exports,module){

    var $ = require('zepto');
    var queue = require('../../../../modules/queue/queue');
	queue.setTimeout = 100;
    //autoComplete组件 2011.1.07
    $.fn.autoComplete = function(options){
        var setting = {
            ajaxUrl:"http://m.taobao.com", //ajax路径
            operator:'.J_autocomplete', //触发搜索文本框
            wrapEl:'.wrap', //内容展示层
            meatEl:'.meat', //用来包裹列表内层元素的层
            childEl:'li', //列表内层元素
            submit:'.btn',//提交表单的按钮
            close:'.close',//关闭内容展示层
            collapse:'collapse', //收缩状态class
            expand:'expand', //展开状态class
            delay:0, //延迟时间，2012.6.28暂时引入了队列，来阻止异步的时候，出现的bug，异步的设置里有timeout
            anim:true, //是否动画
            isUseKey:true, //用于开启或者关闭---检测用户是否使用了搜索联想词进行搜索功能
            history: false, //历史记录请求的url
            clearHistory: "clear", //清除历史的url
            max: 7, //最多记录数
            //点击列表项时执行
            afterItemClick: function(n) {
               console.log(n);
            }
        }
        if(options){
            $.extend(setting, options);
        };
        var self = this;


        var autoComplete = {
			ajax: [],
			hisList : null
		};

        $(this).each(function(){
            var self = $(this);
            //console.log(self);
			/* 优先请求历史记录 */
			if(setting.history){
				$.ajax({
					url:setting.history,
					type:"GET",
					dataType:"jsonp",
					error:function(){
						console.log('网络连接失败，请刷新页面重试');
						return false;
					},
					success:function(json){
						autoComplete.hisList = json;
					}
				});
			}
            var operator = $(this).find(setting.operator);
            var $close = self.find(setting.close);
            //设置文本框的autocomplete
            operator.attr('autocomplete','off');
            //解决HTML5 placeholder属性在Android Webkit上的交互细节BUG
            operator.focus(function(){
                if($(this).val() == ''){
                    $(this).val('');
                }
            });
			
            operator.keyup(initInput).on("input",initInput);
            operator.focus(function(e){
                var data;
                data = $(this).val().replace(/(^\s+)|(\s+$)/g,'');
                if(data.length==0 && setting.history){
                    //self.find(setting.wrapEl).slideUp();
                    queue.clear();
                    queue.add(getHistory);
                    queue.start();
                    return;
                }
            });

            function initInput(e){
                var e = e||window.event;
                var data;
                data = $(this).val().replace(/(^\s+)|(\s+$)/g,'');
                //文本为空时返回
                if(data.length==0 && setting.history){
                    //self.find(setting.wrapEl).slideUp();
                    queue.clear();
                    queue.add(getHistory);
                    queue.start();
                    return;
                }
                if(e.keyCode==13 || e.keyCode==32) return;
                //首次触发滚动屏幕，让文本框置顶
                if (!this.onceScroll) toTop();
                this.onceScroll = true;
				
				//搜索店铺，关闭浮层
				var st = self.find('#J_ST'),
					st_name = st.attr('name');
				
				if(st.length > 0 && st_name == "event_submit_do_search_shop"){
						
					//self.find(setting.wrapEl).slideUp('normal');
					self.find(setting.wrapEl).hide();
					return false;
				}
				
                queue.clear();
                queue.add(getList,data);
                queue.start();
				
            };

            //异步请求数据
            function getList(text){
                var ajaxurl = setting.ajaxUrl;
				
                autoComplete.ajax.push($.ajax({
                    url:ajaxurl,
                    type:"GET",
                    dataType:"jsonp",
                    data:"code=utf-8&extras=1&q=" + text,
                    error:function(){
                        //alert('网络连接失败，请刷新页面重试');
                        return false;
                    },
                    success:function(json){
                        pack(json);
                        $close.html("关闭").removeClass("clear");
                    }
                }));
            }
            //获得历史记录
            function getHistory(){
				var json = autoComplete.hisList;
				if(json){
                	pack(json);
					$close.html("清除历史记录").addClass("clear");
				}
            }

            //清除历史记录
            function clearHistory(){
                $.get(setting.clearHistory + "&callback=?");
            }

            //DOM组装联想搜索数据
            function pack(json){
                if(json.result != false && json.result.length > 0){ //请求结果成功
                    if(setting.isUseKey){
                         self.find('#J_IsUseSearchSuggest').val('');
                    }
                    var html = '';
                    var num = json.result.length > setting.max ? setting.max : json.result.length;
                    for(i=0;i<num;i++){
                        render(i);
                    }
                    self.find(setting.meatEl).html(html);
                    effect();
                }else{
                    //self.find(setting.wrapEl).slideUp('normal');
                    self.find(setting.wrapEl).hide();
                    return;
                }
				
                function render(loop){
                    html += '<li key="'+ json.result[i][0] +'">'+ json.result[i][0] +'</li>';
                }
            }

            //组装内容后操作
            function effect(){
                var timer = null;
                //展开联想搜索内容
                timer = setTimeout(function(){
                    if(!setting.anim){
                        self.removeClass(setting.collapse).addClass(setting.expand);
                    }else{
                        self.find(setting.wrapEl).show();
                    }
                },setting.delay);

                //避免重复绑定
                self.find(setting.close).unbind('click');
                self.find(setting.childEl).unbind('click');

                //点击关闭联想内容
                self.find(setting.close).click(function(){
                    var interval = 0;
                    var timer = null;
                    timer = setTimeout(function(){
                        if(!setting.anim){
                            self.removeClass(setting.expand).addClass(setting.collapse);
                        }else{
                            self.find(setting.wrapEl).hide();
                        }
                    },setting.delay);

                    //interval = $(window).scrollTop() - operator.offset().top;
                    if (interval > 0) toTop();
                    if($close.hasClass("clear")) {
                        clearHistory();
                    }
                });

                //搜索提交表单
                self.find(setting.childEl).click(function(){

                    var $this = $(this);
                    setting.afterItemClick.call(this,Number($this.index()) + 1);
                    //暂时注释
                    //if(setting.isUseKey){
                    //    self.find('#J_IsUseSearchSuggest').val($('#J_StatisticsKeyword').val());
                    //}
                    var text= $this.attr('key');
                    //console.log(text);
                    self.find(setting.operator).val(text); //赋值给文本框

                    //触发提交
                    //var evt = document.createEvent("MouseEvents");  
                    //evt.initEvent("click", true, true);  
                    //self.find(setting.submit)[0].dispatchEvent(evt);
                    self.find(setting.submit)[0].click();
                });
            }

            //让文本框位置移到顶部
            function toTop(){
                var offsetTop = operator.offset().top;
                setTimeout(function(){window.scrollTo(0,offsetTop)}, 1000);
            }



            //是否历史功能
            if (setting.history) {
                autoComplete.getHistory = function(){
					queue.clear();
                    queue.add(getHistory);
                    queue.start();	
				};
            }else{
                autoComplete.getHistory = function(){};
            };
            autoComplete.close = function(){
                queue.clear();
				if(autoComplete.ajax.length){
					for(i=0;i<autoComplete.ajax.length;i++){
						autoComplete.ajax[i].abort();	
					}
					autoComplete.ajax = [];
				}
                self.find(setting.wrapEl).hide();
            }
        });
        return autoComplete;
    };

});
