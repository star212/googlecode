/*
Author:SMbey0nd(完颜小卓|wangzhuo@use.com.cn), Follow me on Twitter:SMbey0nd
apply:TBTouch 手机淘宝触屏版全局样式
date:2010-7-27
note:
    1.依赖jQuery
	svn 玄寂
*/

(function( $ ){

    var TBTouch = window.TBTouch = {
        //初始化
        init:function(){
            this.hideScrollBar();
        },
        //自动隐藏地址栏
        hideScrollBar:function(){			
			$(window).bind('load',function(){
				if($("#J_Nav").length > 0){
				    setTimeout(scrollTo, 0, 0, 25);
				}else{
				    setTimeout(scrollTo, 0, 0, 1);
				}
			});
        },
        //简单的UA判断，检测iPhone/Android
        deviceDetect:function(options){
            //可选UA关键字：iphone, ipod, symbian, palm...
            var setting = {
                device:'android' //默认为检测Android
            };
            if(options){
                $.extend(setting,options);
            };
            var uagent = navigator.userAgent.toLowerCase();
            if (uagent.search(setting.device) > -1){
                return true;
            }else{
                return false;
            }
        },
        //简单的屏幕旋转检测，兼容iPhone和Android
        orient:function(){

            var supportsOrientationChange = "onorientationchange" in window,
            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
            $(window).bind(orientationEvent,function(){
                switch(window.orientation){
                    case 0 :
                    case 180 :
                        $('body').removeClass('landscape');
                        break;
                    case 90 :
                    case -90 :
                        $('body').addClass('landscape');
                        break;
                }
                typeof window.DeviceOrientationEvent != 'undefined' ? TBTouch.tabfix() : setTimeout(function(){TBTouch.tabfix()},10);
            });
            if(window.orientation != 0){
                $('body').addClass('landscape');
            }
        },
		
		
        //玄寂 修复tab选项卡尖尖头位置
        tabfix : function(){
            var isFixed = $('head').find('style') && $('head').find('style').hasClass('tabfix');
            //console.log(isFixed);
            var tabCSS = '';
            var isLandscape = false;
            var left = Math.floor($('.common-tab li.cur').width()/2)-8;
            //alert(left)
            $('body').hasClass('landscape') ? isLandscape = true : isLandscape;
            //console.log(isLandscape)
            isFixed ? tabCSS : tabCSS += '<style type="text/css" class="tabfix">';
            //console.log(tabCSS);
            if(isLandscape){
                tabCSS += 'body.landscape .common-tab li.cur:before';
                tabCSS += ' {left:'+left+'px}';
                tabCSS += 'body.landscape .common-tab li.cur:after';
                tabCSS += ' {left:'+(left+1)+'px}';
            }else{
                tabCSS += '.common-tab li.cur:before';
                tabCSS += ' {left:'+left+'px}';
                tabCSS += '.common-tab li.cur:after';
                tabCSS += ' {left:'+(left+1)+'px}';
            }
            isFixed ? tabCSS : tabCSS += '</style>';
            //console.log(tabCSS);
            isFixed ? $('style.tabfix').html(tabCSS) : $('head').append(tabCSS);
        },
        //面包屑
        bread:function(){
            return{
                init:function(){
                    this.ellips();
                },
                ellips:function(){
                    $('#J_BreadEll a').click(function(){
                        $.maskRender({popup:'#J_Bread_Popup'});
                        return false;
                    });
                }
            };
        }(),
        pagination : function(){
            // 如果总页数小于1不进行任何绑定操作 没必要啊 不管你信不信 反正我是信了
            if(parseInt($('#J_Status .sum').text()) > 1){
                $('#J_Status').unbind('click').bind('click',function(){
                    var close = function(){
                        $('.pagination').removeClass('open');
                        $('.pagination').addClass('close');
                    }
                    //给window 监测屏幕旋转情况，如果在打开状态，则关闭分页滑竿。因为这涉及到一系列值的更换所以关闭更加快捷明了
                    var supportsOrientationChange = "onorientationchange" in window,
                    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
                    $(window).bind(orientationEvent,function(){
                        close();
                    });
                    //给body绑定 . 任何在一角tap 如果在pagination层包括pagination内不关闭 滑竿 反之 你懂的
                    document.body.addEventListener("touchstart", function(e){
                        //console.log(e.target.className);
                        if(!$(e.target).parents().hasClass('pagination') && !$(e.target).hasClass('pagination')) {
                            close();
                        }
                    },false);
                    //开关.动画效果由css3动画完成
                    if($('.pagination').hasClass('open')){
                        close();
                    }else{
                        $('.pagination').removeClass('close');
                        $('.pagination').addClass('open');
                    }

                    var pageSum = parseInt($('#J_Status .sum').text()); //总页码
                    var curNum = parseInt($('#J_Status .cur').text()); //当前页码
                    var barWidth = parseInt($('#J_Slider .bar').outerWidth()); //当前滑动条长度
                    var curbarWidth = parseInt($('#J_Slider .curbar').outerWidth()); //当前滑动条长度
                    var knobWidth = parseInt($('#J_Slider .knob').outerWidth()); //小球宽度
                    var border = [0,barWidth-knobWidth]; //边界值
                    var _width = Math.ceil(border[1]*curNum/pageSum+10);
                    //最终得到对应页码下小圆球的位置
                    var setWidth = function(_width){
                        $('#J_Slider .knob').css('left',_width)    ;
                        $('#J_Slider .curbar').css('width',_width)    ;
                    }
                    setWidth(_width);
                    //console.log('总页码:'+pageSum+'当前页码:'+curNum+'当前滑动条长度:'+barWidth+'当前滑动条长度:'+curbarWidth+'小球宽度:'+knobWidth);
                    $('#J_Slider .knob')[0].addEventListener("touchmove", function(e){
                        //console.log(e.changedTouches[0].clientX)
                        //var target;
                        //e.target.nodeName.toLowerCase() == 'span' ? target = $(e.target).parent() : target = $(e.target);
                        e.preventDefault();
                        // 滑动X值
                        var _widths = e.changedTouches[0].clientX;
                        // 滑动是对应的页码
                        var moveNum ;
                        //第一页所占有的像素长度
                        var numOne = Math.ceil(border[1]/pageSum+10);
                        //综合判断滑动时是不是超过100页和低于一页，否则进行相关操作
                        if(_widths <= numOne){
                            _widths = numOne;
                        }else if(_widths >= barWidth){
                            _widths =  border[1]+10;
                        }
                        //计算得到滑动对应页码
                        moveNum = Math.floor((_widths-10)*pageSum/border[1]);
                        //插入页码
                        $('#J_Status .cur').text(moveNum);

                        setWidth(_widths);
                        //setWidth(e.touches[0].clientX)
                        //console.log(target)

                    },false);
                    //滑动结束如果不是一开始滑动的页码则进行相应的跳转
                    $('#J_Slider .knob')[0].addEventListener("touchend", function(e){
                        //console.log('touchend');
                        var p = parseInt($('#J_Status .cur').text());
                        var para = $('#J_Pag_Param').val();
                        var href = $('#J_Pag').val() + '&' + para + '=' +p;
                        if(p != curNum)  window.location.href = href;
                    },false);

                })
            }
        },
        //浮动层dom节点处理
        popShift:function(o){
            if($(o).length>0){
                $(o).remove().clone(true).prependTo('body');
            }
        },

        //2011 首页改版 搜索模块 功能描述：选择需要搜索的类目（搜宝贝，搜店铺，搜商城）

        searchtabs : function(){
            var searchTabs = $('#J_SearchTabs');
            var searchTabsList = $('#J_SearchTabs').siblings('.tab-list');
            var key = $('#J_SKey').val();
            searchTabs.unbind('click').bind('click',function(){
                searchTabs.addClass('none');
                searchTabsList.removeClass('none');

            });
            searchTabsList.find('li').unbind('click').bind('click',function(){
                $('#J_ST').attr('name',($(this).attr('i')));
                searchTabs.find('b').text($(this).text());
                searchTabsList.addClass('none');
                searchTabs.removeClass('none');
            });
            $('#J_SKey').bind('focus',function(){
                //console.log(key)
                if($(this).val() == key) $(this).val('');
                searchTabsList.addClass('none');
                searchTabs.removeClass('none');
            })

            $('#J_SKey').bind('blur',function(){
                if($(this).val() == '' ) $(this).val(key);
            })
        },

        /**
         * @intro:   "快速访问手机淘宝" 提示框 (仅支持 iPhone 和 iPod)
         * @usage:   TBTouch.shortcutTips('淘宝商城'), 确保包含在 jQuery.ready() 内。
         * @param：  channel 默认为"手机淘宝"，可自设为 "淘宝商城" "聚划算" "推推" 等 ...
         * @credits: 部分代码来自 完颜 玄寂 和 张军，由 左使 进行代码重构。　
         */
        shortcutTips: function( channel ) {

            channel = channel || "手机淘宝";

            if ( 'standalone' in navigator && (deviceIs('iphone.*safari') || deviceIs('ipod.*safari')) ) {
            
                // 若通过主屏幕方式访问，则不再显示提示框
                if ( navigator.standalone || localStorage.showTips == "false" ) {
                    localStorage.showTips = "false";
                    return true;
                }
                
                packTips();
                
                // 等背景图片加载完成再显示
                $( window ).load( function() {
                    $( this ).bind('touchstart', hideTips ).bind('scroll touchend', showTips );
                });
            }

            function deviceIs( device ) {
                return navigator.userAgent.search( new RegExp( device , 'i' ) ) > -1;
            }
            
            function packTips() {
                var tips = ['<div class="shortcutTips">',
                                '<div class="wrap">',
                                    '<span class="close">&times;</span>',
                                    '<p class="tips"> 快速访问 ', channel, ' ! </p>',
                                    '<p class="howto">请按下方图标，然后选择 " 添加至主屏幕 " 。</p>',
                                '</div>',
                            '</div>'].join('');

                $('body').append( tips );
                
                hideTips();
                
                $('.shortcutTips .close').click( function() {
                    localStorage.showTips = "false";
                    hideTips();
                });
            }
            
            function showTips() {
                if ( localStorage.showTips != "false" ) {
                    $('.shortcutTips').css('top', window.innerHeight + window.scrollY - 80 ).hide().fadeIn( 160 );
                }
            }
            
            function hideTips( e ) {
              var offset = $('.shortcutTips .wrap').offset();
              if ( e && e.pageX > offset.left && e.pageX < offset.left + 230 
                     && e.pageY > offset.top && e.pageY < offset.top + 66 ) {
                return;
              }
              $('.shortcutTips').hide();
            }
        }
    };

    TBTouch.init(); //初始化
    $(function(){ //全局DOM完毕后的处理
        TBTouch.orient();
        TBTouch.tabfix();
        TBTouch.popShift('.popup');
        TBTouch.searchtabs();
    });

    //通用页头
    //v2 by 完颜 @ 2011-9-17
    TBTouch.header = {
        init:function(){
            this.popup();
            TBTouch.popShift('.header-panel');
            this.tap();
            this.app();
            this.msg();
        },
        //弹出搜索层(v1)
        popup:function(){
            $('#J_Search a').click(function(){
                $.maskRender({popup:'#J_Search_Popup'});
                //联想搜索
                var url = 'http://suggest.taobao.com/sug';
                $('#J_Search_Popup').autoComplete({ajaxUrl:url,wrapEl:'.suggest',meatEl:'.suggest .meat',close:'.suggest .close',anim:true});
                return false;
            });
        },
        //图片翻转(v2)
        tap:function(){
            $('nav.quick > ul > li.mytaobao > a').bind('click', function(e){
                e.stopPropagation(); //阻止冒泡
                _tap($(this));
            });
            $('nav.quick > ul > li.cart > a').bind('click', function(e){
                e.stopPropagation();
                _tap($(this));
            });
            var _tap = function(self){
                if(!self.parent().hasClass('cur')){
                    self.parent().addClass('cur');
                }
            };
        },
        //公共切换(v2)
        tab:function(o){
            if($(o).attr('data-bind') == 'false'){ //避免重复绑定
                $(o + ' > a').bind('click', function(){
                    var self = $(this);
                    self.parent().siblings().removeClass('cur');
					//判断是否为首页，以确定消息盒子距顶部的距离
					if($("#J_Nav").length > 0){
						$(o + '_Panel').css("top", "75px");
					}else{
						$(o + '_Panel').css("top", "50px");
					}
                    $('.header-panel').slideUp();
                    if(self.parent().hasClass('cur')){ //收起
                        self.parent().attr('data-autopush','false'); //收起时做标记，以备msg不再自动弹出菜单
                        $(o + '_Panel').slideUp(function(){
                            self.parent().removeClass('cur');
                        });
                    }else{ //打开
                        self.parent().attr('data-autopush','true'); //打开时做标记，以备msg重新自动弹出菜单
                        self.parent().addClass('cur');
                        $(o + '_Panel').slideDown(function(){
                            $(this).removeClass('none')
                        });
                    }
                    return false;
                });
                //空白区域收起。
                $('.content').bind('click', function(){
                    if($('#J_Header_Msg').hasClass('cur')){
                        $('#J_Header_Msg').attr('data-autopush','false'); //收起时做标记，以备msg不再自动弹出菜单
                        $('.header-panel').slideUp(function(){
                            $('nav.quick > ul > li').removeClass('cur');
                        });
                    }
                })
                $(o).attr('data-bind','true');
            }
        },
        //应用盒子(v2)
        app:function(){
            this.tab('#J_Header_App');
        },
        //消息(v2)
        msg:function(){
            //初始化
            if($('#J_Header_Msg').hasClass('new')){
                this.tab('#J_Header_Msg');
                /*
                //有新消息时，展开下拉框。本次这个功能暂时不提供。
                $('#J_Header_Msg_Panel').slideDown(function(){
                    $(this).removeClass('none')
                });
                */
            }
            /*兼容旧页头 - 如果J_Header_Msg不存在，则中断执行*/
            if($('#J_Header_Msg').length == 0){
                return false;
            }

            var ajaxurl = $('#J_Header_Msg').attr('data-url');

            /*兼容登录前 - 如果未登录，则不请求*/
            if(ajaxurl == undefined || ajaxurl == ''){
                return false;
            }

            var errCount = 0;
            var pushTime_Default = 5000; //默认轮询间隔
            var pushTime = parseInt($('#J_Header_Msg').attr('data-cycle')); //轮询间隔

            /*时间异常状态处理 - 如果找不到、为空或为0，则按照默认时间(5000)请求*/
            if(isNaN(pushTime) == true || pushTime == 0){
                pushTime = pushTime_Default;
            }
            //开始轮询
            var pushID = window.setInterval(function(){
                $.ajax({
                    url:ajaxurl,
                    type:"get",
                    dataType:"jsonp",
                    //dataType:"json",
                    //data:"",
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log('错误信息：' + XMLHttpRequest.readyState + ' ' + XMLHttpRequest.status + ' ' + textStatus);
                        errCount ++;
                        if(errCount > 2){ //请求错误超过3次，不再轮询
                            clearInterval(pushID);
                        }
                    },
                    success:function(json){
                        var result = json.result, //结果，true / false
                            totalMsgCount = json.totalMsgCount, //总消息数目
                            wwMsgCout = json.wwMsgCout, //旺旺消息数目
                            logisticsMsgCount = json.logisticsMsgCount, //物流消息数目
                            taobaoRadioMsgCount = json.taobaoRadioMsgCount; //推推消息数目
                            var msg = [wwMsgCout,logisticsMsgCount,taobaoRadioMsgCount];
                        if(result){
                            if(totalMsgCount > 0){ //有新消息时，填充数据
                                var href = $('#J_Header_Msg > a').attr('href');
                                // $('#J_Header_Msg > a').attr('href','').attr('data-href',href); //清除旺旺的href地址，避免iOS地址栏跳动
                                $('#J_Header_Msg > a').attr({'href': '', 'data-href': href});     // BUGFIX by 左使: 连续两次调用attr()在某些版本iOS中报错
                                if(wwMsgCout == 0 && (logisticsMsgCount != 0 || taobaoRadioMsgCount != 0)){ //只有淘宝消息
                                    $('#J_Header_Msg').removeClass('ww');
                                }else{
                                    $('#J_Header_Msg').addClass('ww');
                                }
                                TBTouch.header.tab('#J_Header_Msg');
                                $('#J_Header_Msg').addClass('new').find('a i').text(totalMsgCount);
                                for(var i = 0; i < 3 ; i++){ //填充数据
                                    if(msg[i] > 0){
                                        $('#J_Header_Msg_Panel li').eq(i).removeClass('none');
                                        $('#J_Header_Msg_Panel li').eq(i).find('em').text(msg[i]);
                                    }else{
                                        $('#J_Header_Msg_Panel li').eq(i).addClass('none');
                                    }
                                }
                                /*
                                if(!$('#J_Header_Msg').hasClass('cur')){ //模拟点击，展开下拉。本次这个功能暂时不提供。
                                    if($('#J_Header_Msg').attr('data-autopush') == 'true'){ //如果用户手动收起菜单，则不再自动弹出，除非再手动点击
                                        $('#J_Header_Msg > a').trigger('click');
                                    }
                                }
                                */
                            }else{ //请求后发现新消息没了（可能性较低），解除绑定事件，清空数据，收回下拉菜单
                                var href = $('#J_Header_Msg > a').attr('data-href');
                                // $('#J_Header_Msg > a').attr('href',href).attr('data-href',''); //重新填充旺旺的href地址
                                $('#J_Header_Msg > a').attr({'href': href, 'data-href': ''});     // BUGFIX by 左使: 连续两次调用attr()在某些版本iOS中报错
                                $('#J_Header_Msg > a').unbind('click');
                                $('#J_Header_Msg').attr('data-bind','false').removeClass('new').removeClass('cur');
                                $('#J_Header_Msg_Panel li em').text('0');
                                $('#J_Header_Msg_Panel').slideUp();
                            }
                        }
                    }
                });
            },pushTime);
            //clearInterval(pushID);
        }
    };


    //插件和扩展

    //弹出层组件
    //去除delay默认的500ms by 完颜 2011-5-16
    $.maskRender = function(options){
        var setting = {
            popup:'.popup', //外层容器
            inner:'.fix', //遮罩容器
            meat:'.meat', //内容区容器
            deflect:59, //高度偏移量
            //delay:0, //关闭时的时间延迟
            hidebody:true, //隐藏content（用来保证不出现滚动条）
            bindclose:true, //绑定关闭事件
            totop:true //置顶
        };
        if(options){
            $.extend(setting,options);
        };
        var height = $(window).height() + 60; //60是默认地址栏高度 //检测出的$(window).height()一般是416
        $(setting.popup) //开启层
            .css('min-height',height).removeClass('none') //popup的高度
            .find(setting.inner).show().end() //对话框动画
            .find(setting.inner).children(setting.meat).css('min-height',height-setting.deflect).end() //设置min-height
        if(setting.bindclose){
            $(setting.popup).find('.operator .common-btn-small').click(function(){ //绑定关闭按钮事件
                $(this).unbind('click').parents(setting.inner).hide().parents(setting.popup).addClass('none');
                if(setting.hidebody){
                    $('.content').removeClass('none');
                }
                if($(this).attr('tagName') == 'A'){
                    return false;
                }
            });
        }
        if(setting.hidebody){
            $('.content').addClass('none');
        }
        if(setting.totop){
            setTimeout(scrollTo, 0, 0, 1);
        }
    };
    //N位随机数组件
    $.rand = function(options){
        var setting = {
            number:5 //位数，默认5位
        };
        if(options){
            $.extend(setting,options);
        };
        var num = '';
        for(var i=0;i<setting.number;i++) {
            num += Math.floor(Math.random()*10).toString(10);
        }
        return parseInt(num);
    };
    //点击高亮组件
    $.fn.highLight = function(options){
        var setting = {
            multi:true, //是否多个元素
            single:true, //是否单选
            touch:false,
            el:'a', //对象元素
            cl:'highlight', //高亮class
            stopEv:true //阻止a的默认事件
        };
        if(options){
            $.extend(setting,options);
        };
        return $(this).each(function(){
            if(setting.multi){
                function fireIt(e){
                    if(setting.single){
                        $(e).siblings().removeClass(setting.cl);
                    }
                    $(e).addClass(setting.cl);
                    //alert($(this).attr('class'));
                }
                //是否允许兼容touch事件
                if(setting.touch){
                    $(this).find(setting.el).bind('touchstart', function(){
                        fireIt(this);
                    });
                }
                $(this).find(setting.el).bind('click', function(){
                    fireIt(this);
                });
            }else{
                $(this).click(function(){
                    $(this).addClass(setting.cl);
                });
            }
            if(setting.stopEv){
                $(this).find(setting.el).click(function(){
                    return false;
                });
            }
        });
    };

    //浮动定位组件
    $.fn.fixed = function(options){
        var setting = {
            bottom:0 //底边距
        }
        if(options){
            $.extend(setting, options);
        };
        var self = this;
        //var top = parseInt($(self).css('top'));
        $(window).scroll(function(e){
            return $(this).each(function(){
                //console.log($(window).scrollTop() + $(document).height());
                //var y = $(window).scrollTop() + document.documentElement.clientHeight - 85;
                var y = $(window).scrollTop() + document.documentElement.clientHeight - 85;
                $(self).css('top',y);
            });
        });
    };

    //抽屉组件
    $.fn.drawer = function(options){
        var setting = {
            operator:'.operator a', //抽屉把手
            shift:{ //文本转换
                avail:false,
                text:['收起','展开']
            },
            inner:'.meat',
            collapse:'collapse', //收缩状态class
            expand:'expand', //展开状态class
            anim:true //是否动画
        }
        if(options){
            $.extend(setting, options);
        };
        var self = this;
        //var top = parseInt($(self).css('top'));
        return $(this).each(function(){
            var self = $(this);
            $(this).find(setting.operator).click(function(){
                if(self.hasClass(setting.collapse)){
                    self.removeClass(setting.collapse).addClass(setting.expand);
                    if(setting.anim){
                        self.find(setting.inner).slideDown('normal');
                    }
                    if(setting.shift.avail){
                        $(this).text(setting.shift.text[0]);
                    }
                }else{
                    self.removeClass(setting.expand).addClass(setting.collapse);
                    if(setting.anim){
                        self.find(setting.inner).slideUp('normal');
                    }
                    if(setting.shift.avail){
                        $(this).text(setting.shift.text[1]);
                    }
                }
                return false;
            });
        });
    };

    //ScrollLayer组件™ v1.0 beta
    /*require:
    */
    $.fn.scrollLayer = function(options){
        var setting = {
            direction:'X', //方向。X代表水平方向，Y代表垂直方向
            wrapEl:'.wrap', //外层容器。用来overflow遮罩的层
            touchEl:'.holder', //touch层容器。用来包裹列表内层元素的层
            childEl:'li', //内层元素。用来放图的层
            margin:5, //间距。以实际元素间距为准
            speed:0.9, //加速度。一般取0.9-1之间
            prevent:true //阻止超链接默认事件
        };
        if(options){
            $.extend(setting, options);
        };
        var width = 0, height = 0, wrapWidth = 0, wrapHeight = 0;
        var scroll;
        var touch = $(this).find(setting.touchEl);
        return $(this).each(function(){
            var child = $(this).find(setting.childEl);
            //计算内部总高/宽度
            if(setting.direction == 'X'){
                for(var i=0;i<child.size();i++) {
                    width += child.eq(i).width() + setting.margin*2;
                }
                touch.width(width);
                wrapWidth = $(this).find(setting.wrapEl).width();
            }else{
                for(var i=0;i<child.size();i++) {
                    height += child.eq(i).height() + setting.margin*2;
                }
                touch.height(height);
                wrapHeight = $(this).find(setting.wrapEl).height();
            }
            //屏蔽超链接事件
            if(setting.prevent){
                $(this).find('a').click(function(){
                    return false;
                });
            }
            touch[0].onmousedown = touch[0].ontouchstart = startDrag;
            //开始拖放
            function startDrag(e){
                var pos = [touch.position().left, touch.position().top];
                var startPoint = getClient(e); //开始点
                var startTime = new Date().getTime();
                var step = 10, //滚动精度
                    endPoint,
                    speed,
                    distance = 0;
                if(setting.direction == 'X'){
                    var min = -width + wrapWidth + setting.margin*2; //右侧范围值（负值）
                }else{
                    //var min = -width + $(setting.outerEl).height();
                    var min = -height + wrapHeight + setting.margin*2; //下侧范围值（负值）
                }
                var max = 0;
                clearInterval(scroll); //清除计时器

                touch[0].ontouchmove = touch[0].onmousemove = moveDrag;
                touch[0].ontouchend = document.onmouseup = endDrag;
                return false;

                //拖放结束后的滚动加速度
                function extraScroll() {
                    //distance += Math.round(speed*(step/1000));
                    distance += speed*(step/1000);
                    var newPos = endPoint + distance;
                    if (newPos > max || newPos < min) {
                        clearInterval(scroll);
                        return;
                    }
                    if(setting.direction == 'X'){
                        touch[0].style.left = newPos + 'px';
                    }else{
                        touch[0].style.top = newPos + 'px';
                    }
                    speed *= setting.speed; //加速度
                    if (Math.abs(speed) < 10) {
                        speed = 0;
                        clearInterval(scroll);
                    }
                }
                //拖放移动
                function moveDrag(e){
                    var currentPos = getClient(e);
                    if(setting.direction == 'X'){
                        var newPos = (currentPos - startPoint) + pos[0];
                    }else{
                        var newPos = (currentPos - startPoint) + pos[1];
                    }
                    if (newPos <= max && newPos >= min) {
                        if(setting.direction == 'X'){
                            touch[0].style.left = newPos + 'px';
                        }else{
                            //this.style.top = newPos - 11 + 'px';
                            touch[0].style.top = newPos + 'px';
                        }
                    }
                }
                //结束拖放
                function endDrag(e){
                    var end = getClient(e);
                    if(setting.direction == 'X'){
                        endPoint = touch[0].offsetLeft;
                    }else{
                        endPoint = touch[0].offsetTop;
                    }
                    var endTime = new Date().getTime();
                    var dist = end - startPoint;
                    var time = endTime - startTime;
                    speed = dist/(time/1000);
                    scroll = setInterval(extraScroll,step);
                    touch[0].ontouchmove = touch[0].ontouchend = touch[0].onmousemove = document.onmouseup = null;
                }
                //获取动作当前坐标
                function getClient(e){
                    var coors = 0;
                    if (e.changedTouches){ //iPhone
                        if(setting.direction == 'X'){
                            coors = e.changedTouches[0].clientX;
                        }else{
                            coors = e.changedTouches[0].clientY;
                        }
                    }else {
                        if(setting.direction == 'X'){
                            coors = e.clientX;
                        }else{
                            coors = e.clientY;
                        }
                    }
                    return coors;
                }
            }
        });
    };

    //autoComplete组件 2011.1.07
    $.fn.autoComplete = function(options){
        var setting = {
            ajaxUrl:"http://m.taobao.com", //ajax路径
            operator:'.txt', //触发搜索文本框
            wrapEl:'.wrap', //内容展示层
            meatEl:'.meat', //用来包裹列表内层元素的层
            childEl:'li', //列表内层元素
            submit:'.btn',//提交表单的按钮
            close:'.close',//关闭内容展示层
            collapse:'collapse', //收缩状态class
            expand:'expand', //展开状态class
            delay:300, //延迟时间
            anim:true, //是否动画
            isUseKey:true //用于开启或者关闭---检测用户是否使用了搜索联想词进行搜索功能
        }
        if(options){
            $.extend(setting, options);
        };
        var self = this;
        return $(this).each(function(){
            var self = $(this);
            //console.log(self);
            var operator = $(this).find(setting.operator);
            //设置文本框的autocomplete
            operator.attr('autocomplete','off');
            //解决HTML5 placeholder属性在Android Webkit上的交互细节BUG
            operator.focus(function(){
                if($(this).val() == ''){
                    $(this).val('');
                }
            });

            operator[0].onkeyup = operator[0].oninput = initInput;

            function initInput(e){
                var e = e||window.event;
                var data;
                data = $(this).val().replace(/(^\s+)|(\s+$)/g,'');
                //文本为空时返回
                if(data.length==0){
                    self.find(setting.wrapEl).slideUp('normal');
                    return;
                }
                if(e.keyCode==13 || e.keyCode==32) return;
                //首次触发滚动屏幕，让文本框置顶
                if (!this.onceScroll) toTop();
                this.onceScroll = true;
                getList(data);
            };
            //
            //异步请求数据
            function getList(text){
                var ajaxurl = setting.ajaxUrl;
                $.ajax({
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
                    }
                });
            }

            //DOM组装联想搜索数据
            function pack(json){
                if(json.result != false){ //请求结果成功
                    if(setting.isUseKey){
                         self.find('#J_IsUseSearchSuggest').val('');
                    }
                    var html = '';
                    var num = json.result.length > 5 ? 5 : json.result.length;
                    for(i=0;i<num;i++){
                        render(i);
                    }
                    self.find(setting.meatEl).html(html);
                    effect();
                }else{
                    self.find(setting.wrapEl).slideUp('normal');
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
                        self.find(setting.wrapEl).slideDown('normal').show();
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
                            self.find(setting.wrapEl).slideUp('normal');
                        }
                    },setting.delay);

                    interval = $(window).scrollTop() - operator.offset().top;
                    if (interval > 0) toTop();
                });

                //搜索提交表单
                self.find(setting.childEl).click(function(){
                    if(setting.isUseKey){
                        self.find('#J_IsUseSearchSuggest').val($('#J_StatisticsKeyword').val());
                    }
                    var text= $(this).attr('key');
                    console.log(text);
                    self.find(setting.operator).val(text); //赋值给文本框
                    self.find(setting.submit).click(); //提交表单
                });
            }

            //让文本框位置移到顶部
            function toTop(){
                var offsetTop = operator.offset().top;
                setTimeout(function(){window.scrollTo(0,offsetTop)}, 1000);
            }

        });
    };


/**
 * slideLayer组件  - Update 2011.12.06 zhangjun
 * @param {Object} options
 * @example {
 *   direction: {String} 可选参数。 滚动方向 - X代表水平方向，Y代表垂直方向
 *   wrapEl: {String} 可选参数。 外层容器 - 用来overflow遮罩的层
 *   slideEl: {String} 可选参数。 滑动层 - 用来包裹内层元素
 *   childEl: {String} 可选参数。 内层元素 - 用来展现文字、图片
 *   prev: {String} 可选参数。 Prev按钮 - 前一张 触发器
 *   next: {String} 可选参数。 Next按钮 - 下一张 触发器
 *   disable: {String} 可选参数。  按钮不可点击样式
 *   counter: {String} 可选参数。  计数器容器
 *   countStyle: {String} 可选参数。  计数器容器 - 默认是点表示：dot
 *   effect: {String} 可选参数。  支持效果 - 通过手指移动滑动：scroll，通过触发器滑动：slide，两者支持：both
 *   current: {Int} 可选参数。  当前显示图片的ID - 默认是 1
 *   timer: {Int} 可选参数。  滑动时间 - 默认是 0.3s
 *   autoplay: {Int} 可选参数。  自动播放 - 默认是 1
 *   cycle: {Int} 可选参数。  循环播放 - 默认是 1
 */
$.fn.slideLayer_v2 = function(options){
    var setting={
		direction:'X', 
		wrapEl:'.wrap', 
		slideEl:'.holder', 
		childEl:'li', 
		prev:'.prev', 
		next:'.next', 
		disable:'disabled', 
		counter:'.counter', 
		countStyle:'dot',
		effect:'both', 
		current:1, 
		timer:300,
		autoplay:1,
		cycle:1
	};
    if(options){
        $.extend(setting, options);
    };
	
    return $(this).each(function(){
		var self = $(this);
		var cur = setting.current;
		var width = 0, height = 0, wrapWidth = 0, wrapHeight = 0;
		var total = Math.ceil(self.find(setting.childEl).length);
		var child = self.find(setting.childEl);
		var touch = self.find(setting.slideEl);
		
		//计算外层容器宽、高
		wrapWidth = self.find(setting.wrapEl).width();
		wrapHeight = self.find(setting.wrapEl).height();

		//计算内部宽、高
		if(setting.direction == 'X'){
			for(var i=0;i<child.size();i++) {
				width += child.eq(i).width();
			}
			touch.width(width);
		}else{
			for(var i=0;i<child.size();i++) {
				height += child.eq(i).height();
			}
			touch.height(height);
		}

        //初始化状态
        if (setting.direction == 'X') {
            self.find(setting.slideEl).css('left',-(wrapWidth*(cur-1)));
        }else{
            self.find(setting.slideEl).css('top',-(wrapHeight*(cur-1)));
        }
        updateStatus();

        switch(setting.effect){
            case 'slide':
                slide();
                break;

            case 'scroll':
                scroll();
                break;

            case 'both':
                slide();
                scroll();
        }
        //scroll
        function scroll(){
            if(setting.direction == 'X'){
                var min = -width + wrapWidth; //右侧范围值（负值）
            }else{
                var min = -height + wrapHeight; //下侧范围值（负值）
            }
            var max = 0;
            touch[0].onmousedown = touch[0].ontouchstart = startDrag;
            //开始拖放
            function startDrag(e){
                var startPoint,
                    currentPos,
                    endPoint;
                if(setting.autoplay == 1) processor.process();
                //autoplay.disposeT(autoplay.id);
                //console.log('触摸，计时器销毁');
                var pos = [touch.position().left, touch.position().top];

                startPoint = getClient(e); //开始点

                touch[0].ontouchmove = touch[0].onmousemove = moveDrag;

                //拖放移动
                function moveDrag(e){
                    currentPos = getClient(e);

                    if(setting.direction == 'X'){
                        var newPos = (currentPos[0] - startPoint[0]) + pos[0];

                        if(Math.abs(currentPos[0] - startPoint[0]) - Math.abs(currentPos[1] - startPoint[1]) > 0){
                            e.preventDefault();

                            followMove();
                            touch[0].ontouchend = document.onmouseup = endDrag;
                        }else{
                            return;
                        }

                    }else{
                        var newPos = (currentPos[1] - startPoint[1]) + pos[1];

                        e.preventDefault();

                        followMove();
                        touch[0].ontouchend = document.onmouseup = endDrag;
                    }

                    //跟随移动
					function followMove(){
						if (newPos <= max && newPos >= min) {
							if(setting.direction == 'X'){
								touch[0].style.left = newPos + 'px';
							}else{
								touch[0].style.top = newPos + 'px';
							}
						}else{
							//console.log('已经达边界值');
						}
					}
                }
                //结束拖放
                function endDrag(e){
                    var dist,
                        extra,
                        endPoint = getClient(e);
                    if(setting.autoplay == 1) processor.process();
                    //autoplay.startT();
                    //console.log('停止触摸，计时器激活');
                    if(setting.direction == 'X'){
                        dist = endPoint[0] - startPoint[0];

                        extraMove(e);

                    }else{
                        dist = endPoint[1] - startPoint[1];

                        extraMove(e);

                    }
                    //拖动结束后，让元素移动到临界值
                    function extraMove(e){
                        //console.log(slideTimer)
                        if(dist < -5){
                            slideTimer.process(nextfn);
                        }else if(dist > 5){
                            slideTimer.process(prefn);
                        }
                    }

                    updateStatus(); //更新状态
                    touch[0].ontouchmove = touch[0].ontouchend = touch[0].onmousemove = document.onmouseup = null;
                }
            }

            //获取动作当前坐标
            function getClient(e){
                var coors = new Array();
                coors[0] = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
                coors[1] = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
                return coors;
            }

        }
        
		//slide
		var prefn = function(){
			if(setting.autoplay == 1){
				processor.process();
			}
			
			if(setting.cycle == 1){
				if(cur != 1){
					prev(); //上一张
					return false;				
				}else{
					prev(); //上一张
					child.eq(total-1).css('left',-(wrapWidth*total));
					child.eq(0).css('left',0);
					return false;
				}
			}else{
				if(cur != 1){
					prev(); //上一张
					return false;				
				}
			}
		};
		var nextfn = function(){
			if(setting.autoplay == 1){
				processor.process();
			}
			
			if(setting.cycle == 1){
				if(cur!=total){
					next(); //下一张
					return false;
				}else{
					next();
					child.eq(0).css('left',wrapWidth*total);
					self.find(setting.wrapEl).css('left',0);
					return false;					
				}
			}else{
				if(cur!=total){
					next(); //下一张
					return false;
				}
			}
		};
		
		var slideTimer = {
			timerid : null,
			action : function(fn){
				fn();
			},
			process : function(fn){
				clearTimeout(slideTimer.timerid);
				slideTimer.timerid = setTimeout(function(){
					slideTimer.action(fn);
				},setting.timer)
			}
		};
		
		
		function slide(){
					
			self.find(setting.prev).click(function(e){
				if(setting.cycle == 1){
					slideTimer.process(prefn);	
				}else{
					if(cur != 1){
						slideTimer.process(prefn);
					}
				}
			});
			
			self.find(setting.next).click(function(e){
				if(setting.cycle == 1){
					slideTimer.process(nextfn);	
				}else{
					if(cur!=total){
						slideTimer.process(nextfn);
					}
				}
			});
			
		}
			
		//上一张滚动
		function prev(){
			if (setting.direction == 'X') {	
				wrapWidth = self.find(setting.wrapEl).width();
				self.find(setting.slideEl).animate({
					left:-(wrapWidth*(cur-2))
				},setting.timer,function(){
					updateStatus(); //更新状态
					self.find(setting.wrapEl).find('ul').css('left',-(wrapWidth*(cur-1)));
					child.eq(total-1).css('left',0);
				});
				
			}else{
				self.find(setting.slideEl).animate({
					top:-(wrapHeight*(cur-2))
				},setting.timer,function(){});
			}
			cur == 1 ? cur = total : cur--;
		}
		//下一张滚动
		function next(){
			if (setting.direction == 'X') {	
				wrapWidth = self.find(setting.wrapEl).width();
				self.find(setting.slideEl).animate({
					left:-(wrapWidth*cur)
				},setting.timer,function(){
					updateStatus(); //更新状态
					self.find(setting.wrapEl).find('ul').css('left',-(wrapWidth*(cur-1)));
					child.eq(0).css('left',0);
				});
			}else{
				self.find(setting.slideEl).animate({
					top:-(wrapHeight*cur)
				},setting.timer);
			}
			cur == total? cur = 1 : cur++;
		}

		//更新triggers状态
		function updateStatus(){
			
			//组装计数器
			var html = '',
				counter = self.find(setting.counter);
				
			if(counter.length > 0){
				
				if(setting.countStyle == 'dot'){
					
					var i = 0;
					for(i=1; i<=total; i++){
						html += '<li>' + i + '</li>';
					}
					counter.find('ul').html(html);
					
					//给计数器添加标识
					counter.find('li').eq(cur-1).addClass('cur').siblings().removeClass('cur');
					
				}else{
					
					html = '<span class="cur">'+ cur +'</span> / <span class="total">'+ total +'</span>';
                	counter.html(html);
					
				}
			
				//给当前显示的元素添加标识
				child.eq(cur-1).addClass('cur').siblings().removeClass('cur');
			}

			//如果循环播放，设置按钮状态
			if(setting.cycle != 1){
			
				var prev = self.find(setting.prev),
					next = self.find(setting.next);
				
				prev.removeClass(setting.disable);
				next.removeClass(setting.disable);
					
				if(cur == 1){
					prev.addClass(setting.disable);
				}else if(cur == total){
					next.addClass(setting.disable);
				}
			}
		}
		
        var processor = {
            timeoutId: null,

            performProcessing: function(){
                nextfn();
            },

            process: function(){
                clearInterval(processor.timeoutId);
                processor.timeoutId  = setInterval(function(){
                    processor.performProcessing();
                }, 5000);
            },

            dispose : function(){
                clearInterval(processor.timeoutId);
                return;
            }
        };

        if(setting.autoplay == 1 ){
            processor.process();
        }

    });
};



})( jQuery );
