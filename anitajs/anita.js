/**
 * Anita UI Framework v0.0.3
 * http://anitajs.org
 * 
 * Copyright 2014, Alex Tseng
 * Licensed under the MIT-style license.
 * http://anitajs.org/license
 */


'use strict';

(function(K){

	var local = {};

	var document = this.document;

	local.document = document;
	local.root = document.documentElement;

	Object.append(local, {
		version: '0.0.3',
		log: K.print,
		noop: K.noop,
		type: K.type,
		defer: K.defer,
		uniqueID: K.uniqueID,
		env: K.env,
		dom: K.dom,
		bind: function(element){
			return K.event.addEvent.apply(element, arguments);
		},
		unbind: function(element){
			return K.event.removeEvent.apply(element, arguments);
		}
	});

	local.locale = K.locale('anita');

	local.ready = K.prototype.ready;

	local.ready(function(){
		var nodes = [], items = [];
		var matched = local.config.matched;
		var selector = [matched.controller, matched.important].map(function(item){
			return '[' + item + ']';
		}).join(',');

		if (document.querySelectorAll){
			nodes = document.querySelectorAll(selector);
			for (var i = 0, node; node = nodes[i++];){
				if (!node.__anita__root__){
					var childs = node.querySelectorAll(selector);
					for (var j = 0, child; child = childs[j++];) child.__anita__root__ = true;
					items.push(node);
				} else delete node.__anita__root__;
			}
		} else {
			items.push(document.body);
		}

		items.forEach(function(item){
			local.find(item);
		});
	});

	if (!this.anita) this.anita = local;

}).call(/*<CommonJS>*/typeof exports !== 'undefined' ? exports : /*</CommonJS>*/this, Klass);
(function(local){

	var options = {
	
		// prefix for directives
		prefix: 'ai',

		// interpolate expression delimiters
		interpolate: ['{{', '}}'],
		
		// log debug info
		debug: false
	};

	var plugins = {

		prefix: function(value){
			if (typeof value === 'string'){
				var prefix = value.replace(/-*$/, '-');

				if (prefix !== kernel.prefix){
					Object.append(kernel.matched, {
						important: prefix + 'important',
						controller: prefix + 'controller',
						attribute: new RegExp(prefix + '(\\w+)-?(.*)')
					});

					kernel.prefix = prefix;

					this.interpolate([kernel.openTag, kernel.closeTag]);
				}
			}
		},

		interpolate: function(options){
			var prefix = kernel.prefix;

			if (prefix && Array.isArray(options)){
				var openTag = options[0], closeTag = options[1];

				if (openTag && closeTag && openTag !== closeTag){
					var openTagRegExp = openTag.escapeRegExp(),
						closeTagRegExp = closeTag.escapeRegExp();

					Object.append(kernel.matched, {
						expression: new RegExp(openTagRegExp + '(.*?)' + closeTagRegExp),
						expressions: new RegExp(openTagRegExp + '(.*?)' + closeTagRegExp, 'g'),
						bind: new RegExp(openTagRegExp + '.*?' + closeTagRegExp + '|\\s' + prefix)
					});

					kernel.openTag = openTag;
					kernel.closeTag = closeTag;
				}
			}
		}

	};

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function kernel(){
		var options = kernel.options = Object.merge.apply(null, [kernel.options || {}].append(arguments));

		for (var name in options) if (hasOwnProperty.call(options, name)){
			var value = options[name];
			if (typeof kernel.plugins[name] === 'function') kernel.plugins[name](value);
			else if (typeof value === 'object') Object.append(kernel[name], value);
			else kernel[name] = value;
		}

		return this;
	}

	kernel.plugins = plugins;
	kernel.matched = {};
	kernel(options);

	local.config = kernel;

})(anita);
(function(local){

	var rcomplextype = /^(?:object|array)$/;

	local.util = {
	
		isEnumerable: function(item){
			return rcomplextype.test(local.type(item));
		},

		createCacheSpace: function(len){
			var stored = [];

			function storage(key, value){
				if (stored.push(key) > len) delete storage[stored.shift()];
				return storage[key] = value;
			}
			return storage;
		}
		
	};

})(anita);
(function(window){

	var defineProperty = Object.defineProperty;
	var defineProperties;

	// 如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
	// 标准浏览器使用__defineGetter__, __defineSetter__实现
	try {
		defineProperty({}, '~', {});
		defineProperties = Object.defineProperties;
	} catch (e){
		if ('__defineGetter__' in window){
			defineProperty = function(object, property, descriptor){
				if ('value' in descriptor) object[property] = descriptor.value;
				if ('get' in descriptor) object.__defineGetter__(property, descriptor.get);
				if ('set' in descriptor) object.__defineSetter__(property, descriptor.set);
				return object;
			};

			defineProperties = function(object, descriptors){
				for (var property in descriptors){
					if (descriptors.hasOwnProperty(property)){
						defineProperty(object, property, descriptors[property]);
					}
				}
				return object;
			};
		}
	}

	/*<ltIE8>*/
	if (!defineProperties && window.VBArray){
		window.execScript([
			'Function VBParser(code)',
			'\tExecuteGlobal(code)',
			'End Function',
			'Dim VBClassBodies',
			'Set VBClassBodies = CreateObject(\"Scripting.Dictionary\")',
			'Function findOrDefineVBClass(name, body)',
			'\tDim found',
			'\tfound = \"\"',
			'\tFor Each key in VBClassBodies',
			'\t\tIf body = VBClassBodies.Item(key) Then',
			'\t\t\tfound = key',
			'\t\t\tExit For',
			'\t\tEnd If',
			'\tnext',
			'\tIf found = \"\" Then',
			'\t\tVBParser(\"Class \" + name + body)',
			'\t\tVBClassBodies.Add name, body',
			'\t\tfound = name',
			'\tEnd If',
			'\tfindOrDefineVBClass = found',
			'End Function'
		].join('\n'), 'VBScript');

		var VBMediator = function(object, name, value){
			var accessor = object[name];
			if (typeof accessor === 'function'){
				if (arguments.length === 3) accessor(value);
				else return accessor();
			}
		};

		var rexpose = /^\$\d+$/;

		defineProperties = function(name, accessorProperty, dataProperty){
			var constructor = 'VBConstructor' + setTimeout('1'), buffer = [];
			var property, expose;

			buffer.push(
				'\r\nPrivate [__data__], [__proxy__]',
				'\tPublic Default Function [__const__](d, p)',
				'\t\tSet [__data__] = d: set [__proxy__] = p',
				'\t\tSet [__const__] = Me', //链式调用
				'\tEnd Function'
			);

			// 添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
			for (property in dataProperty){
				buffer.push('\tPublic [' + property + ']');
				if (!expose && rexpose.test(property)) expose = property.substr(1);
			}

			buffer.push('\tPublic [' + 'hasOwnProperty' + ']');

			//添加访问器属性 
			for (property in accessorProperty){
				if (!(property in dataProperty)){ // 防止重复定义
					buffer.push(
						// 由于不知对方会传入什么,因此set, let都用上
						'\tPublic Property Let [' + property + '](val' + expose + ')', //setter
						'\t\tCall [__proxy__]([__data__], \"' + property + '\", val' + expose + ')',
						'\tEnd Property',
						'\tPublic Property Set [' + property + '](val' + expose + ')', //setter
						'\t\tCall [__proxy__]([__data__], \"' + property + '\", val' + expose + ')',
						'\tEnd Property',
						'\tPublic Property Get [' + property + ']', //getter
						'\tOn Error Resume Next', // 必须优先使用set语句,否则它会误将数组当字符串返回
						'\t\tSet[' + property + '] = [__proxy__]([__data__],\"' + property + '\")',
						'\tIf Err.Number <> 0 Then',
						'\t\t[' + property + '] = [__proxy__]([__data__],\"' + property + '\")',
						'\tEnd If',
						'\tOn Error Goto 0',
						'\tEnd Property'
					);
				}
			}

			buffer.push('End Class');

			var defined = window['findOrDefineVBClass'](constructor, buffer.join('\r\n'));
			if (constructor === defined) window.VBParser([
				'Function ' + constructor + 'Factory(accessor, mediator)', //创建实例并传入两个关键的参数
				'\tDim o',
				'\tSet o = (New ' + constructor + ')(accessor, mediator)',
				'\tSet ' + constructor + 'Factory = o',
				'End Function'
			].join('\r\n'));
			return window[constructor + 'Factory'](accessorProperty, VBMediator); //得到其产品
		};
	}
	/*</ltIE8>*/

	Object.defineProperties = defineProperties;

})(window);
(function(local){

	var expose = Date.now(),
		subscribers = '$' + expose,
		slice = Array.prototype.slice;

	var Registry = {}; //将函数曝光到此对象上，方便访问器收集依赖

	var Register = {

		get: function(){
			return Registry[expose];
		},

		set: function(item){
			if (item) Registry[expose] = item;
		},

		has: function(){
			return !!Registry[expose];
		},

		clear: function(){
			delete Registry[expose];
		}

	};

	var startComputedCollect = function(start){
		local.openComputedCollect = !!start;
	};

    var sanctuaryContainer = local.document.createElement('div');
    sanctuaryContainer.innerHTML = 'a';

	var Subscriber = {

		regist: function(data){
			Register.set(data); //暴光此函数,方便Subscriber.collect收集
			startComputedCollect(true);

			var fn = data.evaluator;
			if (fn){ //如果是求值函数
				if (data.type === 'duplex') data.handler();
				else data.handler(fn.apply(0, data.args), data.element, data);
			} else { //如果是计算属性的accessor
				data();
			}

			startComputedCollect();
			Register.clear();
		},

		// 收集依赖于这个访问器的订阅者
		collect: function(accessor){
			if (Register.has()){
				var list = accessor[subscribers];
				list && list.include(Register.get()); //只有数组不存在此元素才push进去
			}
		},

		// 通知依赖于这个访问器的订阅者更新自身
		notify: function(accessor){
			var list = accessor[subscribers];
			if (list && list.length){
				var args = slice.call(arguments, 1);
				for (var i = list.length, fn; fn = list[--i];){
					var element = fn.element;

					if (element && !local.dom.contains(sanctuaryContainer, element)){
						var removed = typeof element.sourceIndex === 'number' ?  // IE6 - IE11 
							element.sourceIndex === 0 : !local.dom.contains(local.root, element);

						if (removed){ //如果它没有在DOM树
							list.splice(i, 1);
							local.log('remove ' + fn.name);
						}
					}

					if (typeof fn === 'function') fn.apply(0, args); //强制重新计算自身
					else if (fn.getter) fn.handler.apply(fn, args); //处理监控数组的方法
					else fn.handler(fn.evaluator.apply(0, fn.args || []), element, fn);
				}
			}
		}

	};

	local.sanctuaryContainer = sanctuaryContainer;

	local.addRegister = Register.set;

	local.removeRegister = Register.clear;

	local.subscriber = Subscriber;

	local.subscribers = subscribers;

	local.expose = expose;

})(anita);
(function(local){
//compiler
	var VModels = {},
		stopRepeatAssign = false,
		subscriber = local.subscriber,
		subscribers = local.subscribers,
		internalProperties = String('$id,$watch,$unwatch,$fire,$events,$model,$retain,$accessors,' + subscribers).split(',');

	var util = local.util;

	var slice = Array.prototype.slice,
		splice = Array.prototype.splice;

	var W3C = window.dispatchEvent;

	var rchecktype = /^(?:object|array)$/;

	var Observable = {

		$watch: function(type, fn){
			if (typeof fn === 'function'){
				this.$events[type] = this.$events[type] || [];
				this.$events[type].push(fn);
			} else { //重新开始监听此VM的第一重简单属性的变动
				this.$events = this.$watch.backup;
			}
			return this;
		},

		$unwatch: function(type, fn){
			var len = arguments.length;

			if (len === 0){ //让此VM的所有$watch回调无效化
				this.$watch.backup = this.$events;
				this.$events = {};
			} else if (len === 1){ // remove all handlers
				delete this.$events[type];
			} else { // remove specific handler
				var events = this.$events[type] || [];
				var i = events.length;
				while (~--i < 0){
					if (events[i] === fn) return events.splice(i, 1);
				}
			}
			return this;
		},

		$fire: function(type){
			this.$events = this.$events || {};
			var events = this.$events[type] || [];
			var args = slice.call(arguments, 1);
			for (var i = 0, fn; fn = events[i++];) fn.apply(this, args);
		}

	};

	function Collection(model){
		var array = [];
		array.$id = local.uniqueID();
		array.$model = model; // model.concat()
		array.$events = {};
		array[subscribers] = [];
		array._ = modelFactory({
			length: model.length
		})
		array._.$watch('length', function(a, b){
			array.$fire('length', a, b)
		})
		Object.append(array, Observable, CollectionPrototype);
		return array;
	}

	var CollectionPrototype = {
		
		_splice: splice, 

		_add: function(array, index){
			var length = this.length;
			index = typeof index === 'number' ? index : length;
			var added = []
			for (var i = 0, l = array.length; i < l; i++){
				added[i] = convert(array[i])
			}
			splice.apply(this, [index, 0].concat(added))
			subscriber.notify(this, 'add', index, added)
			if (!this._stopFireLength){
				return this._.length = this.length
			}
		},

		_del: function(pos, n){
			var ret = this._splice(pos, n)
			if (ret.length){
				subscriber.notify(this, 'del', pos, n)
				if (!this._stopFireLength){
					this._.length = this.length
				}
			}
			return ret
		},

		push: function(){
			Array.prototype.push.apply(this.$model, arguments);
			var length = this._add(arguments)
			subscriber.notify(this, 'index', length > 2 ? length - 2 : 0)
			return length
		},

		shift: function(){
			var item = this.$model.shift();
			this._del(0, 1)
			subscriber.notify(this, 'index', 0);
			return item; //返回被移除的元素
		},

		unshift: function(){
			Array.prototype.unshift.apply(this.$model, arguments);
			this._add(arguments, 0);
			subscriber.notify(this, 'index', arguments.length);
			return this.$model.length;
		},

		pop: function(){
			var item = this.$model.pop();
			this._del(this.length - 1, 1);
			return item;
		},

		empty: function(){
			this.$model.length = this.length = this._.length = 0;
			subscriber.notify(this, 'empty', 0);
			return this;
		},

		size: function(){
			return this._.length;
		},

		//contains: function(item){
		//	return this.indexOf(item) !== -1;
		//},

		splice: function(a, b){
			// 必须存在第一个参数，需要大于-1, 为添加或删除元素的基点
			a = resetNumber(a, this.length)
			var removed = splice.apply(this.$model, arguments),
					ret = []
			this._stopFireLength = true //确保在这个方法中 , $watch("length",fn)只触发一次
			if (removed.length){
				ret = this._del(a, removed.length)
				if (arguments.length <= 2){ //如果没有执行添加操作，需要手动resetIndex
					subscriber.notify(this, 'index', a)
				}
			}
			if (arguments.length > 2){
				this._add(slice.call(arguments, 2), a)
			}
			this._stopFireLength = false
			this._.length = this.length
			return ret //返回被移除的元素
		},

		remove: function(item){ //移除第一个等于给定值的元素
			return this.removeAt(this.indexOf(item));
		},

		removeAt: function(index){ //移除指定索引上的元素
			return index >= 0 ? this.splice(index, 1) : [];
		},

		//include: function(item){
		//	if (!this.contains(item)) this.push(item);
		//	return this;
		//},
		
		set: function(index, item){
			if (index >= 0){
				var type = local.type(item);
				if (item && item.$model) item = item.$model;

				var target = this[index];
				if (type === 'object'){
					for (var i in item) if (target.hasOwnProperty(i)) target[i] = item[i];
				} else if (type === 'array'){
					target.empty().append(item);
				} else if (target !== item){
					this[index] = item;
					subscriber.notify(this, 'set', index, item);
				}
			}
			return this;
		}

	};

	'sort,reverse'.split(',').forEach(function(method){
		CollectionPrototype[method] = function(){
			var aaa = this.$model,
				bbb = aaa.slice(0),
				sorted = false
			Array.prototype[method].apply(aaa, arguments) //先移动model
			for (var i = 0, n = bbb.length; i < n; i++){
				var a = aaa[i], 
					b = bbb[i]
				if (!isEqual(a, b)){
					sorted = true
					var index = bbb.indexOf(a, i)
					var remove = this._splice(index, 1)[0]
					var remove2 = bbb.splice(index, 1)[0]
					this._splice(i, 0, remove)
					bbb.splice(i, 0, remove2)
					subscriber.notify(this, 'move', index, i)
				}
			}
			bbb = void 0
			if (sorted){
				subscriber.notify(this, 'index', 0)
			}
			return this
		}
	});

	function resetNumber(index, len){ //用于模拟slice, splice的效果
		index = Math.floor(index) || 0;
		return index < 0 ? Math.max(len + index, 0) : Math.min(index, len);
	}

	function convert(item){
		if (util.isEnumerable(item)){
			item = item.$id ? item : modelFactory(item, item);
		}
		return item;
	}

	function modelFactory(scope, model){
		if (Array.isArray(scope)){
			var array = scope.concat(); //原数组的作为新生成的监控数组的$model而存在
			scope.length = 0;
			var collection = Collection(scope);
			collection.append(array);
			return collection;
		}

		if (typeof scope.nodeType === 'number') return scope;

		var vmodel = {}; //要返回的对象
		model = model || {}; //放置$model上的属性

		var normalProperties = {}; //普通属性
		var accessingProperties = {}; //监控属性
		var computedProperties = []; //计算属性
		var watchProperties = arguments[2] || {}; //强制要监听的属性
		var retainProperties = scope.$retain; //要忽略监控的属性

		for (var i = 0, name; name = internalProperties[i++];){
			delete scope[name];
			normalProperties[name] = true;
		}

		if (Array.isArray(retainProperties)){
			for (var i = 0, name; name = retainProperties[i++];) normalProperties[name] = true;
		}

		for (var i in scope) loopModel(
			i, 
			scope[i], 
			model, 
			normalProperties, 
			accessingProperties, 
			computedProperties, 
			watchProperties
		);

		vmodel = Object.defineProperties(vmodel, descriptorFactory(accessingProperties), normalProperties); //生成一个空的ViewModel

		for (var name in normalProperties) vmodel[name] = normalProperties[name];

		watchProperties.vmodel = vmodel;
		vmodel.$model = model;
		vmodel.$events = {};
		vmodel.$id = local.uniqueID();
		vmodel.$accessors = accessingProperties;
		vmodel[subscribers] = [];
		for (var i in Observable){
			var fn = Observable[i];
			if (!W3C){ //在IE6-8下，VB对象的方法里的this并不指向自身，需要用bind处理一下
				fn = fn.bind(vmodel);
			}
			vmodel[i] = fn;
		}
		vmodel.hasOwnProperty = function(name){
			return name in vmodel.$model;
		};
		for (var i = 0, fn; fn = computedProperties[i++];){ //最后强逼计算属性 计算自己的值
			local.addRegister(fn);
			fn();
			subscriber.collect(fn);
			local.removeRegister();
		}
		return vmodel;
	}

	function loopModel(name, value, model, normalProperties, accessingProperties, computedProperties, watchProperties){
		model[name] = value;

		//如果是指明不用监控的系统属性或元素节点，或放到 $retain 里面
		if (normalProperties[name] || (value && value.nodeType)) return normalProperties[name] = value;

		//如果是$开头，并且不在watchMore里面的
		if (name.charAt(0) === '$' && !watchProperties[name]) return normalProperties[name] = value;

		var type = local.type(value);

		//如果是函数，也不用监控
		if (type === 'function') return normalProperties[name] = value;

		var accessor, oldArgs
		if (type === 'object' && typeof value.get === 'function' && Object.keys(value).length <= 2){
			var setter = value.set,
				getter = value.get;

			//创建计算属性，因变量，基本上由其他监控属性触发其改变
			accessor = function(newValue){
				var vmodel = watchProperties.vmodel;
				var value = model[name], 
					preValue = value;

				if (arguments.length){
					if (stopRepeatAssign) return;

					if (typeof setter === 'function'){
						var backup = vmodel.$events[name];
						vmodel.$events[name] = [] //清空回调，防止内部冒泡而触发多次$fire
						setter.call(vmodel, newValue)
						vmodel.$events[name] = backup
					}

					if (!Object.is(oldArgs, newValue)){
						oldArgs = newValue
						newValue = model[name] = getter.call(vmodel)//同步$model
						local.withProxyCount && updateWithProxy(vmodel.$id, name, newValue)//同步循环绑定中的代理VM
						subscriber.notify(accessor) //通知顶层改变
						vmodel.$fire(name, newValue, preValue);
					}
				} else {
					// 收集视图刷新函数
					if (local.openComputedCollect) subscriber.collect(accessor);

					newValue = model[name] = getter.call(vmodel);
					if (!Object.is(value, newValue)){
						oldArgs = void 0
						vmodel.$fire(name, newValue, preValue);
					}
					return newValue;
				}
			}
			computedProperties.push(accessor);
		} else if (rchecktype.test(type)){
			accessor = function(newValue){ //子ViewModel或监控数组
				var realAccessor = accessor.$vmodel, preValue = realAccessor.$model
				if (arguments.length){
					if (stopRepeatAssign) return;

					if (!Object.is(preValue, newValue)){
						newValue = accessor.$vmodel = updateVModel(realAccessor, newValue, type)
						var fn = rebindings[newValue.$id]
						fn && fn()//更新视图
						var parent = watchProperties.vmodel
						model[name] = newValue.$model//同步$model
						subscriber.notify(realAccessor)   //通知顶层改变
						parent.$fire(name, model[name], preValue)   //触发$watch回调
					}
				} else {
					subscriber.collect(realAccessor) //收集视图函数
					return realAccessor
				}
			}
			accessor.$vmodel = value.$model ? value : modelFactory(value, value);
			model[name] = accessor.$vmodel.$model
		} else {
			accessor = function(value){ //简单的数据类型，监控属性
				var original = model[name];
				if (arguments.length){
					if (!Object.is(original, value)){
						model[name] = value; //同步$model
						var vmodel = watchProperties.vmodel;
						local.withProxyCount && updateWithProxy(vmodel.$id, name, value)//同步循环绑定中的代理VM
						subscriber.notify(accessor); //通知顶层改变
						vmodel.$fire(name, value, original)//触发$watch回调
					}
				} else {
					subscriber.collect(accessor); //收集视图函数
					return original;
				}
			}
			model[name] = value;
		}
		accessor[subscribers] = []; //订阅者数组
		accessingProperties[name] = accessor;
	}

	var descriptorFactory = W3C ? function(obj){
		var descriptors = {};
		for (var i in obj) descriptors[i] = {
			get: obj[i],
			set: obj[i],
			enumerable: true,
			configurable: true
		};
		return descriptors;
	} : function(a){
		return a;
	};


	//with绑定生成的代理对象储存池
	var withProxyPool = {}, 
		//withProxyCount = 0,
		rebindings = {};

	function updateWithProxy($id, name, val){
		var pool = withProxyPool[$id];
		if (pool && pool[name]) pool[name].$val = val;
	}

	function updateVModel(vmodel, def, type){
		//a为原来的VM， b为新数组或新对象
		if (type === 'array'){
			if (Array.isArray(def)) vmodel.empty().append(def.concat());
			return vmodel;
		} else {
			var iterators = vmodel[subscribers] || [];
			if (withProxyPool[vmodel.$id]){
				local.withProxyCount--;
				delete withProxyPool[vmodel.$id];
			}

			var ret = modelFactory(def);
			rebindings[ret.$id] = function(data){
				while (data = iterators.shift()){
					if (data.type) local.defer(function(item){
						item.rollback && item.rollback() //还原 with and on directive
						local.bindingHandlers[item.type](item, item.vmodels);
					}.pass(data));
				}
				delete rebindings[ret.$id];
			}
			return ret;
		}
	}

	local.define = function(id, factory){
		var name = id.$id || id;

		if (typeof name !== 'string'){
			local.error('View module name is missing.');
			return;
		}

		if (VModels[name]){
			local.error('The same name exists view module of the "' + name + '".');
			return;
		}

		var model;
		factory = factory || id;

		if (typeof factory === 'object'){
			model = modelFactory(factory);	
		} else {
			var definition = {
				$watch: local.noop
			};
			factory(definition);

			model = modelFactory(definition);
			stopRepeatAssign = true;
			factory(model);
			stopRepeatAssign = false;
		}

		model.$id = name;

		return VModels[name] = model;
	};

	local.VModels = VModels;
	local.modelFactory = modelFactory;


	local.withProxyPool = withProxyPool;
	local.withProxyCount = 0;

})(anita);
(function(local){

	var util = local.util;

	var keywords =

		// Keywords
		'break,case,catch,continue,debugger,default,delete,do,else,false,' + 
		'finally,for,function,if,in,instanceof,new,null,return,switch,this,' + 
		'throw,true,try,typeof,var,void,while,with,' +
		
		// Reserved words
		'abstract,boolean,byte,char,class,const,double,enum,export,extends,' + 
		'final,float,goto,implements,import,int,interface,long,native,' + 
		'package,private,protected,public,short,static,super,synchronized,' + 
		'throws,transient,volatile,' +

		// ECMA 5 - use strict
		'arguments,let,yield,' +

		// Undefined
		'undefined';

	var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
	var rsplit = /[^\w$]+/g;
	var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
	var rnumber = /\b\d[^,]*/g;
	var rcomma = /^,+|,+$/g;
	var cacheVars = util.createCacheSpace(512);
	var getVariables = function(code){
		var key = ',' + code.trim();
		if (cacheVars[key]) return cacheVars[key];

		var matched = code.replace(rrexpstr, '')
			.replace(rsplit, ',')
			.replace(rkeywords, '')
			.replace(rnumber, '')
			.replace(rcomma, '')
			.split(/^$|,+/);
		return cacheVars(key, uniqueArray(matched));
	};

	function uniqueArray(array, uin){
		var result = [], object = {};
		for (var i = 0, l = array.length; i < l; i++){
			var item = array[i],
				uin = item && typeof item.$id === 'string' ? item.$id : item;
			if (!object[uin]) object[uin] = result.push(item);
		}
		return result;
	}

	// Builds assignment statement
	function buildAssignment(vars, scope, name, type){
		var result = [], 
			prefix = ' = ' + name + '.';

		for (var i = vars.length, prop; prop = vars[--i];){
			if (scope.hasOwnProperty && scope.hasOwnProperty(prop)){ //IE6下节点没有hasOwnProperty
				result.push(prop + prefix + prop);

				if (type === 'duplex') vars.get = name + '.' + prop;
				if (type === 'on') vars.set = name + '.';
				vars.splice(i, 1);
			}
		}

		return result;
	}

	var rduplex = /\w\[.*\]|\w\.\w/;
	var rproxy = /(\$proxy\$[a-z]+)\d+$/;
	var rassign = /\S\s*=\s*\S|\w(--|\+\+)$/;
	var rsince = /^(--|\+\+)(?=\w)/;
	var rfilter = /^(html|text)$/;

	var expose = local.expose, noop = local.noop;
	var cacheExprs = util.createCacheSpace(128);

	var evalExpressions = {

		/**
		 * Declare variables
		 *
		 * Output:
		 * var item = scope.item;
		 */
		declare: 'var {vars};',

		/**
		 * Output:
		 * 
		 * "use strict";
		 * var item = scope.item;
		 * var ret = item;
		 * if(filter.type){ 
		 *		try {
		 *			ret = filter.type(ret);
		 *		} catch(e) {}
		 * }
		 * return ret;
		 **/
		filter: '"use strict";\n{vars}\nvar ret{uin} = {ret};\r\n{evaluator}\nreturn ret{uin};',

		/**
		 * Output:
		 * if(filter.type){ 
		 *		try {
		 *			ret = filter.type(ret);
		 *		} catch(e) {}
		 * }
		 */
		filterExpr: 'if (filter{uin}.{name}){\n\ttry {\n\t\tret{uin} = filter{uin}.{name}(ret{uin}{argument});\n\t} catch(e) {}\n}\n',
	
		/**
		 *  Output: 
		 * "use strict";
		 *	return function(vvv){
		 *		var property = scope.property;
		 *		if(!arguments.length){
		 *			return property
		 *		}
		 *		scope.property = vvv;
		 *	}
		 */
		duplex: '"use strict";\nreturn function(vvv){\n\t{vars}\n\tif(!arguments.length){\n\t\treturn {ret};\n\t}\n\t{evaluator}= vvv;\n}',

		/**
		 * Output:
		 * "use strict";
		 * var event = scope.event;
		 * if(anita.openComputedCollect) return;
		 * return event;
		 */
		on: '"use strict";\n{vars}{evaluator}\nif (anita.openComputedCollect) return;{ret}',
		
		/**
		 * Output: 
		 * "use strict";
		 * var item = scope.item;
		 * return item;
		 */
		dflt: '"use strict";\n{vars}\nreturn {ret};'
	};

	function parseExpression(code, scopes, data){
		var type = data.type;
		var filter = rfilter.test(type) && data.filters || '';

		var expression = scopes.map(function(item){
			return item.$id.replace(rproxy, '$1');
		}) + code + type + filter;

		var vars = getVariables(code).concat(),
			assigns = [], // Assignment statements.
			names = [], // Evaluation function names.
			args = []; // Evaluation function arguments.

		scopes = uniqueArray(scopes);

		for (var i = 0, l = scopes.length; i < l; i++){
			if (vars.length){
				var name = 'vm' + expose + '_' + i;
				names.push(name);
				args.push(scopes[i]);
				assigns.append(buildAssignment(vars, scopes[i], name, type));
			}
		}

		if (!assigns.length && type === 'duplex') return;

		if (filter) args.push(local.filters);
		data.args = args;

		// Get cached expression.
		var fn = cacheExprs[expression];
		if (fn){
			data.evaluator = fn;
			return;
		}

		var declare = assigns.join(', '), evaluator;
		if (declare) declare = 'var ' + declare + ';';

		if (filter){// Process filter, text and duplex binding maybe contains filter.
			var textBuffer = [], fargs;

			for (var i = 0, fname; fname = data.filters[i++];){
				var start = fname.indexOf('(');
				if (start !== -1){
					fargs = ',' + fname.slice(start + 1, fname.lastIndexOf(')')).trim();
					fname = fname.slice(0, start).trim();
				} else {
					fargs = '';
				}

				textBuffer.push(evalExpressions.filterExpr.substitute({
					uin: expose,
					name: fname,
					argument: fargs
				}));
			}

			type = 'filter';
			evaluator = textBuffer.join('');

			names.push('filter' + expose);
		} else if (type === 'duplex'){// Duplex binding
			evaluator = !rduplex.test(code) ? vars.get : code;
		} else if (type === 'on'){// Event binding
			if (rassign.test(code)) code = vars.set + code; // a = b, a = !a ect.
			else if (rsince.test(code)) code = code.replace(rsince, '$1' + vars.set); // ++n, n++ etc.
			else if (code.indexOf('(') === -1) code += '.call(this, $event)';
			else code = code.replace('(', '.call(this,');
			code = '\nreturn ' + code + ';';

			names.push('$event');

			var lastIndex = code.lastIndexOf('\nreturn');
			evaluator = code.slice(0, lastIndex);
			code = code.slice(lastIndex);
		} else {// Others binding
			type = 'dflt';
		}

		try {
			fn = Function.apply(noop, names.concat(evalExpressions[type].substitute({
				vars: declare,
				evaluator: evaluator,
				uin: expose,
				ret: code
			})));

			if (type !== 'on' && type !== 'duplex') fn.apply(fn, args);

			data.evaluator = cacheExprs(expression, fn);
		} catch (e){
			local.log(e.message);
		} finally {
			vars = textBuffer = names = null; // GC
		}
	}

	local.parse = function(code, scopes, data, tokens, proxy){
		if (Array.isArray(tokens)){
			var array = tokens.map(function(token){
				var object = {};
				return token.expr ? parseExpression(token.value, scopes, object) || object : token.value;
			});

			data.evaluator = function(){
				var result = '';
				for (var i = 0, item; item = array[i++];){
					result += typeof item === 'string' ? item : item.evaluator.apply(0, item.args);
				}
				return result;
			};

			data.args = [];
		} else {
			parseExpression(code, scopes, data);
			if (proxy) return;
		}

		if (data.evaluator){
			data.handler = local.bindingExecutors[data.handlerName || data.type];
			data.evaluator.toString = function(){
				return data.type + ' binding to eval(' + code + ')';
			};

			//这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
			//将它移出订阅者列表
			local.subscriber.regist(data);
		}
	};

})(anita);
(function(local){

	var rsplit = /[^, ]+/g,
		parser = local.parse;

	var dom = local.dom,
		noop = local.noop,
		root = local.root,
		util = local.util,
		document = local.document,
		documentFragment = document.createDocumentFragment(),
		matched = local.config.matched;

	var rwithargs = /(?=\b)\(\s*(?:\$event)?\s*\)/;

	var subscribers = local.subscribers;

	//这里的函数每当VM发生改变后，都会被执行（操作方为notifySubscribers）
	var bindingExecutors = {

		attr: function(value, element, data){
			// *-attr-class='xxx' vm.xxx='aaa bbb ccc'将元素的className设置为aaa bbb ccc
			// *-attr-class='xxx' vm.xxx=null  清空元素的所有类名
			// *-attr-name='yyy'  vm.yyy='ooo' 为元素设置name属性
			dom.setProperty(element, data.param, value);
		},

		property: function(value, element, data){
			var method = data.type;

			if (!root.hasAttribute && typeof value === 'string' && (method === 'src' || method === 'href')){
				value = value.replace(/&amp;/g, '&'); //处理IE67自动转义的问题
			}
			element[method] = value;
		},

		style: function(value, element, data){
			var property = data.param;
			property ? dom.setStyle(element, property, value) : dom.setProperty(element, 'style', value);
		},

		'class': function(value, element, data){
			var method = data.type;

			// ai-class-hide="isHidden"
			if (method === 'class' && data.param){
				 dom.toggleClass(element, data.param, !!value);
				 return;
			}

			// ai-class="hide:isHidden"
			// ai-class="hide"
			var className = data.classes || value;
			data.force = data._evaluator ? !!data._evaluator.apply(element, data._args) : true;

			if (data.original && data.original !== className) dom.removeClass(element, data.original);
			data.original = className;

			switch (method){
				case 'class':
					dom.toggleClass(element, className, data.force);
					break;

				case 'hover':
				case 'active':
					if (!data.hasBindEvent){ // Only binding once.
						var leave = 'mouseleave',
							enter = 'mouseenter',
							removeClass = function(){
								data.force && dom.removeClass(element, className);
							};

						if (method === 'active'){
							leave = 'mouseup';
							enter = 'mousedown';
							element.tabIndex = element.tabIndex || -1;
							local.bind(element, 'mouseleave', removeClass);
						}

						local.bind(element, enter, function(){
							data.force && dom.addClass(element, className);
						});
						local.bind(element, leave, removeClass);

						data.hasBindEvent = 1;
					}
					break;
			}
		},

		data: function(value, element, data){
			dom.data(element, data.param, value);
		},

		repeat: function(method, pos, item){
			if (!method) return;

			var data = this, 
				group = data.group,
				proxies = data.proxies,
				parent = data.startRepeat ? data.startRepeat.parentNode : data.callbackElement,
				fragment = documentFragment.cloneNode(false),
				locatedNode, howmany;

			if (method === 'del' || method === 'move') locatedNode = getLocatedNode(parent, data, pos);

			switch (method){
				case 'add': //在pos位置后添加el数组（pos为数字，el为数组）
					var shims = [], lastFn = {}, index, proxy, i, l, node;

					howmany = data.getter().length - 1;

					for (i = 0, l = item.length; i < l; i++){
						index = i + pos;
						proxy = createEachProxy(index, item[i], data, howmany);
						proxies.splice(index, 0, proxy);
						lastFn = shimController(data, fragment, shims, proxy);
					}
					locatedNode = getLocatedNode(parent, data, pos)
					lastFn.node = locatedNode
					lastFn.parent = parent
					parent.insertBefore(fragment, locatedNode)
					for (i = 0; node = shims[i++];) local.find(node, data.vmodels);
					shims = null
					break;

				case 'del': //将pos后的item个元素删掉(pos, item都是数字)
					proxies.splice(pos, item); //移除对应的子VM
					destroyCommentNodes(removeView(locatedNode, group, item));
					break;

				case 'index': //将proxies中的第pos个起的所有元素重新索引（pos为数字，item用作循环变量）
					howmany = proxies.length - 1;
					for (; item = proxies[pos]; pos++){
						item.$index = pos;
						item.$first = pos === 0;
						item.$last = pos === howmany;
					}
					break;

				case 'empty':
					if (data.startRepeat){
						while (true){
							var node = data.startRepeat.nextSibling;
							if (node && node !== data.endRepeat) fragment.appendChild(node);
							else break;
						}
					} else {
						while (parent.firstChild) fragment.appendChild(parent.firstChild);
					}
					destroyCommentNodes(fragment);
					proxies.empty();
					break;

				case 'move': //将proxies中的第pos个元素移动item位置上(pos, item都是数字)
					var t = proxies.splice(pos, 1)[0]
					if (t){
						proxies.splice(item, 0, t)
						var moveNode = removeView(locatedNode, group)
						locatedNode = getLocatedNode(parent, data, item)
						parent.insertBefore(moveNode, locatedNode)
					}
					break;

				case 'set': //将proxies中的第pos个元素的VM设置为item（pos为数字，item任意）
					var proxy = proxies[pos];
					if (proxy) proxy[proxy.$itemName] = item;
					break;

				case 'append': //将pos的键值对从item中取出（pos为一个普通对象，item为预先生成好的代理VM对象池）
					var pool = item
					var callback = getBindingCallback(data.callbackElement, 'data-with-sorted', data.vmodels)
					var keys = [], shims = [], lastFn = {}, i, key;

					for (key in pos){ //得到所有键名
						if (pos.hasOwnProperty(key) && key !== 'hasOwnProperty') keys.push(key)
					}
					if (callback){ //如果有回调，则让它们排序
						var keys2 = callback.call(parent, keys)
						if (keys2 && Array.isArray(keys2) && keys2.length) keys = keys2
					}
					for (i = 0; key = keys[i++];){
						if (key !== 'hasOwnProperty') lastFn = shimController(data, fragment, shims, pool[key])
					}
					lastFn.parent = parent
					lastFn.node = data.endRepeat || null
					parent.insertBefore(fragment, lastFn.node)
					for (i = 0; item = shims[i++];) local.find(item, data.vmodels)
					shims = null
					break;
			}

			iteratorCallback.call(data, arguments);
		},

		html: function(value, node, data){
			value = value == null ? '' : value;

			var replaced = 'count' in data;
			var element = replaced ? node.parentNode : node;

			if (replaced){ // Incremental update
				var fragment, nodes;

				if (value.nodeType === 11){ // documentFragment
					fragment = value;
				} else { // Element, NodeList, text, html
					nodes = value.nodeType === 1 ? value.childNodes : value.item ? value : dom.create(value, null, document);
					fragment = documentFragment.cloneNode(true);
					if (nodes.nodeType === 3) fragment.appendChild(nodes);
					while (nodes[0]) fragment.appendChild(nodes[0]);
				}

				nodes = Array.from(fragment.childNodes);
				if (nodes.length === 0){
					var comment = document.createComment('anita-html');
					fragment.appendChild(comment);
					nodes = [comment];
				}

				element.insertBefore(fragment, node);

				var n = data.count, next = node;
				while (n-- && next){
					next = node.nextSibling;
					element.removeChild(node);
				}

				data.element = nodes[0];
				data.count = nodes.length;
			} else {
				dom.set(element, 'html', value);
			}

			local.defer(function(){
				local.find(element, data.vmodels, 'nodes');
			});
		},

		'if': function(value, element, data){
			var target = data.source || element,
				refer = value ? target : document.createComment('anita-if');

			local.transition(target, value, function(){
				if (refer !== element){
					element.parentNode.replaceChild(refer, element);
					data.element = refer;
				}

				if (value){ //插回DOM树
					if (target.getAttribute(data.name)){
						target.removeAttribute(data.name);
						local.find(target, data.vmodels, 'attributes');
					}
				} else { //移出DOM树
					data.source = element;
					local.sanctuaryContainer.appendChild(element);
				}
			});
		},

		on: function(callback, element, data){
			var fn = data.evaluator, 
				args = data.args,
				specialBind = typeof data.specialBind === 'function';

			callback = function(e){
				return fn.apply(this, args.concat(e));
			};

			if (specialBind) data.specialBind(element, callback);
			else local.bind(element, data.param, callback);

			data.rollback = function(){
				if (specialBind) data.specialUnbind();
				else local.unbind(element, data.param, callback);
			};

			data.evaluator = data.handler = noop;
		},

		text: function(value, element){
			value = value == null ? '' : value;

			if (element.nodeType === 3){ //绑定在文本节点上
				element.data = value;
			} else { //绑定在特性节点上
				dom.setProperty(element, 'text', value);
			}
		},

		visible: function(value, element, data){
			local.transition(element, value, function(){
				element.style.display = value ? data.display : 'none';
			});
		},

		include: function(value, element, data){
			if (!value) return;
			var vmodels = data.vmodels
			var rendered = getBindingCallback(element, 'data-include-rendered', vmodels)
			var loaded = getBindingCallback(element, 'data-include-loaded', vmodels)

			function scanTemplate(text){
				if (loaded){
					text = loaded.apply(element, [text].concat(vmodels))
				}
				dom.set(element, 'html', text)
				local.find(element, vmodels, 'nodes');
				rendered && check(element, function(){
					rendered.call(element)
				})
			}
			if (data.param === 'src'){
				if (includeContents[value]){
					scanTemplate(includeContents[value])
				} else {
					var xhr = getXHR()
					xhr.onreadystatechange = function(){
						if (xhr.readyState === 4){
							var s = xhr.status
							if (s >= 200 && s < 300 || s === 304 || s === 1223){
								scanTemplate(includeContents[value] = xhr.responseText)
							}
						}
					}
					xhr.open('GET', value, true)
					if ('withCredentials' in xhr) xhr.withCredentials = true;
					xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
					xhr.send(null)
				}
			} else {
				//IE系列与够新的标准浏览器支持通过ID取得元素（firefox14+）
				//http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
				var el = value && value.nodeType === 1 ? value : document.getElementById(value)
				if (el){
					if (el.tagName === 'NOSCRIPT' && !(el.innerHTML || el.fixIE78)){ //IE7-8 innerText,innerHTML都无法取得其内容，IE6能取得其innerHTML
						var xhr = getXHR() //IE9-11与chrome的innerHTML会得到转义的内容，它们的innerText可以
						xhr.open('GET', location, false) //谢谢Nodejs 乱炖群 深圳-纯属虚构
						xhr.send(null)
						//http://bbs.csdn.net/topics/390349046?page=1#post-393492653
						var noscripts = document.getElementsByTagName('noscript')
						var array = (xhr.responseText || '').match(rnoscripts) || []
						var n = array.length
						for (var i = 0; i < n; i++){
							var tag = noscripts[i]
							if (tag){ //IE6-8中noscript标签的innerHTML,innerText是只读的
								tag.style.display = 'none' //http://haslayout.net/css/noscript-Ghost-Bug
								tag.fixIE78 = (array[i].match(rnoscriptText) || ['', '&nbsp;'])[1]
							}
						}
					}
					local.defer(function(){
						scanTemplate(el.fixIE78 || el.value || el.innerText || el.innerHTML)
					})
				}
			}
		},

		widget: noop

	};

	var bindingHandlers = {

		attr: function(data, vmodels){
			var text = data.value.trim(), token;

			if (text.indexOf(local.config.openTag) > -1 && text.indexOf(local.config.closeTag) > 2){
				if (matched.expression.test(text) && RegExp.rightContext === '' && RegExp.leftContext === '') text = RegExp.$1;
				else token = local.find(text);
			}

			parser(text, vmodels, data, token);
		},

		repeat: function(data, vmodels){
			var element = data.element, 
				items;

			parser(data.value, vmodels, data, null, true);

			data.handler = bindingExecutors.repeat;
			data.callbackName = 'data-repeat-rendered';
			data.callbackElement = data.parent = element;
			data.getter = function(){
				return this.evaluator.apply(0, this.args || []);
			};

			var ret = true;
			try {
				items = data.getter();
				if (util.isEnumerable(items)) ret = false;
			} catch (e){}

			var isArray = Array.isArray(items),
				indexer = isArray ? ['$first', '$last'] : ['$key', '$val'];

			for (var i = 0, item; item = vmodels[i++];){
				if (item.hasOwnProperty(indexer[0]) && item.hasOwnProperty(indexer[1])){
					data.$outer = item;
					break;
				}
			}
			data.$outer = data.$outer || {};

			var template = documentFragment.cloneNode(false), node;
			var startRepeat = document.createComment('ai-repeat-start')
			var endRepeat = document.createComment('ai-repeat-end')
			data.element = data.parent = element.parentNode;
			data.startRepeat = startRepeat;
			data.endRepeat = endRepeat;
			element.removeAttribute(data.name);
			data.parent.replaceChild(endRepeat, element);
			data.parent.insertBefore(startRepeat, endRepeat);
			template.appendChild(element);

			data.proxies = [];
			data.template = template;
			node = template.firstChild;
			data.fastRepeat = node.nodeType === 1 && template.lastChild === node && !node.attributes[matched.controller] && !node.attributes[matched.important];
			if (ret) return;

			items[subscribers] && items[subscribers].push(data);

			if (isArray){
				data.handler('add', 0, items);
			} else {
				var uin = items.$id, 
					pool = local.withProxyPool[uin];

				if (!pool){
					local.withProxyCount++;
					pool = local.withProxyPool[uin] = {};
					for (var key in items){
						if (items.hasOwnProperty(key) && key !== 'hasOwnProperty'){
							(function(name, value){
								pool[name] = createWithProxy(name, value, data.$outer);
								pool[name].$watch('$val', function(val){
									items[name] = val
								})
							})(key, items[key]);
						}
					}
				}

				data.rollback = function(){
					bindingExecutors.repeat.call(data, 'empty');

					var parent = data.parent, 
						endRepeat = data.endRepeat;

					parent.insertBefore(data.template, endRepeat || null);

					if (endRepeat){
						parent.removeChild(endRepeat);
						parent.removeChild(data.startRepeat);
						data.element = data.callbackElement;
					}
				};
				data.handler('append', items, pool);
			}
		},

		'class': function(data, vmodels){
			var param = data.param, 
				text = data.value,
				className, 
				rightExpr;

			data.handlerName = 'class';

			if (!param || isFinite(param)){
				data.param = ''; // Ignore param of number type.

				var noExpr = text.replace(matched.expressions, function(item){
					return Math.pow(10, item.length - 1); // 将插值表达式插入10的N-1次方来占位
				});
				var index = noExpr.indexOf(':');

				if (~index){
					className = text.slice(0, index);
					rightExpr = text.slice(index + 1);
					parser(rightExpr, vmodels, data, null, true); //决定是添加还是删除

					if (!data.evaluator){
						local.log('Evaluator expression ' + (rightExpr || '').trim() + ' is not defined.');
						return;
					}

					data._evaluator = data.evaluator;
					data._args = data.args;
				}

				var hasExpr = matched.expression.test(className); // *-class='width{{w}}'
				if (!hasExpr) data.classes = className || text;

				parser('', vmodels, data, (hasExpr ? local.find(className) : null));
			} else if (data.type === 'class'){
				parser(text, vmodels, data);
			}
		},

		html: function(data, vmodels){
			parser(data.value, vmodels, data);
		},

		visible: function(data, vmodels){
			data.display = parseDisplay(data.element);
			parser(data.value, vmodels, data);
		},

		duplex: function(data, vmodels){
			var element = data.element, 
				fieldBinding = fieldBindings[element.tagName];

			if (typeof fieldBinding === 'function'){
				data.changed = getBindingCallback(element, 'data-duplex-changed', vmodels) || noop;

				parser(data.value, vmodels, data, 'duplex', true);

				if (data.evaluator && data.args){
					/*var form = element.form
					if (form && form.anitaValidate){
						form.anitaValidate(element)
					}*/
					data.bound = function(type, fn){
						dom.addListener(element, type, fn);
						var rollback = data.rollback;
						data.rollback = function(){
							dom.removeListener(element, type, fn);
							rollback && rollback();
						};
					};
					fieldBinding(element, data.evaluator.apply(null, data.args), data);
				}
			}
		},

		fx: function(data){
			data.element.fxData = {
				transation: data.value
			};
			data.evaluator = noop;
		},

		on: function(data, vmodels){
			data.type = 'on';
			parser(data.value.replace(rwithargs, ''), vmodels, data);
		}/*,

		widget: function(data, vmodels){
			var args = data.value.match(rword),
					element = data.element,
					widget = args[0],
					vmOptions = {}

			if (args[1] === "$"){
				args[1] = void 0
			}
			if (!args[1]){
				args[1] = widget + setTimeout("1")
			}
			data.value = args.join(",")
			var constructor = local.ui[widget]
			if (typeof constructor === "function"){ //*-widget="tabs,tabsAAA,optname"
				vmodels = element.vmodels || vmodels
				for (var i = 0, v; v = vmodels[i++]; ){
					if (VMODELS[v.$id]){ //取得离它最近由用户定义的VM
						var nearestVM = v
						break
					}
				}
				var optName = args[2] || widget //尝试获得配置项的名字，没有则取widget的名字
				if (nearestVM && typeof nearestVM[optName] === "object"){
					vmOptions = nearestVM[optName]
					vmOptions = vmOptions.$model || vmOptions
					var id = vmOptions[widget + "Id"]
					if (typeof id === "string"){
						args[1] = id
					}
				}
				var widgetData = local.getWidgetData(element, args[0]) //抽取data-tooltip-text、data-tooltip-attr属性，组成一个配置对象
				data[widget + "Id"] = args[1]
				data[widget + "Options"] = Object.append({}, constructor.defaults, vmOptions, widgetData)
				element.removeAttribute("*-widget")
				var widgetVM = constructor(element, data, vmodels)
				data.evaluator = noop
				var callback = getBindingCallback(element, "data-widget-defined", vmodels)
				if (callback){
					callback.call(element, widgetVM)
				}
			} else if (vmodels.length){ //如果该组件还没有加载，那么保存当前的vmodels
				element.vmodels = vmodels
			}
			return true
		}*/

	};

	/**
	 * Class property bindings
	 */
	bindingHandlers.hover = bindingHandlers.active = bindingHandlers['class'];

	/**
	 * Text bindings
	 */
	bindingHandlers.data = bindingHandlers.text = bindingHandlers.html;

	/**
	 * If bindings
	 */
	bindingHandlers['if'] = bindingHandlers.html;

	/**
	 * String property bindings
	 *
	 * 与href绑定器 用法差不多的其他字符串属性的绑定器
	 * 建议不要直接在src属性上修改，这样会发出无效的请求，请使用*-src
	 */
	'title,alt,src,value,href'.replace(rsplit, function(name){
		bindingHandlers[name] = function(data){
			data.handlerName = 'property';
			bindingHandlers.attr.apply(null, arguments);
		};
	});
	bindingHandlers.style = bindingHandlers.include = bindingHandlers.attr;

	/**
	 * Event bindings
	 */
	'animationend,blur,change,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scroll'.replace(rsplit, function(name){
		bindingHandlers[name] = function(data){
			data.param = name;
			bindingHandlers.on.apply(0, arguments);
		};
	});

	/*<!mobile>*/
	var supportCompositionEvent = root.addEventListener && document.documentMode > 9; // IE10+ and Modern browsers
	var compositionEvent = ['keyup', 'paste', 'cut', 'change'];
	var compositionEventHook = function(event, defn){
		var key = event.keyCode;
		// command 		  modifiers 			    arrows
		if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;
		if (event.type === 'cut') local.defer(defn);
		else defn();
	};
	/*</!mobile>*/

	/**
	 * Form field bindings
	 */
	var fieldBindings = bindingHandlers.duplex;
	fieldBindings.INPUT = fieldBindings.TEXTAREA = function(element, evaluator, data){
		var type = element.type, 
			method = data.param,
			eventType = 'click',
			rollback, compound, once;

		var callback = function(value){
			once = true;
			data.changed.call(element, value);
		};

		var onCompositionstart = function(){
			compound = true;
		};

		var onCompositionned = function(){
			compound = false;
		};

		var isObserver = function(){
			return dom.data(element, 'duplex-observe') !== 'false';
		};

		//当value变化时改变model的值
		var updateVModel = function(){
			if (compound) return;
			var value = element.lastValue = element.value;
			if (isObserver()){
				evaluator(value);
				callback(value);
			}
		};

		//当model变化时,它就会改变value的值
		data.handler = function(){
			var value = evaluator();
			value = value == null ? '' : value + '';
			if (value !== element.value) element.value = value;
		};

		if (type === 'checkbox' && method === 'radio') type = method;

		if (type === 'radio'){
			var rsmethod = /bool|text/;

			if (!method) eventType = 'mousedown';

			updateVModel = function(){
				if (isObserver()){
					var value = element.value;

					if (!rsmethod.test(method)){
						value = !element.defaultChecked;
						element.checked = value;
					}

					if (method === 'bool') value = value === 'true';

					evaluator(value);
					callback(value);
				}
			};

			data.handler = function(){
				//IE6是通过defaultChecked来实现打勾效果
				element.defaultChecked = (element.checked = rsmethod.test(method) ? evaluator() + '' === element.value : !!evaluator());
			};
		} else if (type === 'checkbox'){
			updateVModel = function(){
				if (isObserver()) callback(Array.from(evaluator())[element.checked ? 'include' : 'erase'](element.value));
			};

			data.handler = function(){
				element.checked = Array.from(evaluator()).indexOf(element.value) > -1;
			};
		} else {
			eventType = (element.attributes['data-duplex-event'] || element.attributes['data-event'] || {}).value;

			if (eventType !== 'change'){
				eventType = supportCompositionEvent ? 'input' : '';

				if (eventType){
					data.bound('compositionstart', onCompositionstart);
					data.bound('compositionned', onCompositionned);
				} else {
					rollback = function(event){
						compositionEventHook(event, updateVModel);
					};

					compositionEvent.forEach(function(type){
						dom.addListener(element, type, rollback);
					});

					data.rollback = function(){
						compositionEvent.forEach(function(type){
							dom.removeListener(element, type, rollback);
						});
					};
				}
			}
		}

		eventType && data.bound(element, eventType, updateVModel);
		element.lastValue = element.value;

		launch(function(){
			if (dom.contains(root, element)){
				if (!element.disabled && element.value !== element.lastValue){
					element.addEventListener ? dispatchEvent(element, 'input') : element.fireEvent('change');
				}
			} else {
				return false;
			}
		});
		local.subscriber.regist(data);

		local.defer(function(){
			if (!once) callback(element.value);
		}, 31);
	};

	fieldBindings.SELECT = function(element, evaluator, data){
		data.handler = function(){
			var value = evaluator();
			value = value && value.$model || value;
			value = Array.from(value).map(String) + '';
			if (value !== element.lastValue){
				dom.set(element, 'value', value);
				element.lastValue = value;
			}
		};

		data.bound('change', function(){
			if (dom.data(element, 'duplex-observe') !== false){
				var value = dom.get(element, 'value');
				if (value !== element.lastValue){
					evaluator(value)
					element.lastValue = value;
				}
				data.changed.call(element, value);
			}
		});

		//先等到select里的option元素被扫描后，才根据model设置selected属性  
		check(element, function(){
			local.subscriber.regist(data);
			data.changed.call(element, evaluator());
		}, 20);
	};

	var timer, ribbon = [], 
		launch = noop;

	function dispatchEvent(element, type, detail){
		var event = document.createEvent('Events');
		event.initEvent(type, true, true);
		if (detail) event.detail = detail;
		element.dispatchEvent(event);
	}

	function ticker(){
		for (var i = ribbon.length - 1; i >= 0; i--){
			if (ribbon[i]() === false) ribbon.splice(i, 1);
		}

		if (!ribbon.length) clearInterval(timer);
	}

	function tick(fn){
		if (ribbon.push(fn) === 1) timer = setInterval(ticker, 30);
	}

	try {
		var inputPrototype = HTMLInputElement.prototype, 
			old = Object.getOwnPropertyDescriptor(inputPrototype, 'value').set; //屏蔽chrome, safari, opera;

		Object.getOwnPropertyNames(inputPrototype);
		Object.defineProperty(inputPrototype, 'value', {
			set: function(value){
				old.call(this, value);
				if (value !== this.lastValue) dispatchEvent(this, 'input');
			}
		});
	} catch (e){
		launch = tick;
	}

	// 确保元素的内容被完全扫描渲染完毕才调用回调
	var interval = /*W3C ? 15 : 50*/15;

	function check(element, callback, millisec){
		var content = NaN;
		var timer = setInterval(function(){
			var html = element.innerHTML;
			if (html === content){
				clearInterval(timer);
				callback();
			} else {
				content = html;
			}
		}, millisec || interval);
	}

	var getBindingCallback = function(element, name, vmodels){
		var method = element.getAttribute(name);
		if (method) for (var i = 0, item; item = vmodels[i++];){
			if (item.hasOwnProperty(method) && typeof item[method] === 'function') return item[method];
		}
	}

	function iteratorCallback(args){
		var callback = getBindingCallback(this.callbackElement, this.callbackName, this.vmodels);
		if (callback) check(this.parent, callback.bind(this.parent, args));
	}

	//得到某一元素节点或文档碎片对象下的所有注释节点
	var queryComments = document.createTreeWalker ? function(context){
		var treeWalker = document.createTreeWalker(context, NodeFilter.SHOW_COMMENT, null, null), 
			comment, results = [];

		while (comment = treeWalker.nextNode()) results.push(comment);
		return results;
	} : function(context){
		return context.getElementsByTagName('!');
	}

	//将通过anita-if移出DOM树放进ifSanctuary的元素节点移出来，以便垃圾回收
	function destroyCommentNodes(parent){
		var comments = queryComments(parent);
		for (var i = 0, comment; comment = comments[i++];){
			if (comment.nodeValue == 'anita-if'){
				var node = comment.element;
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		}
		parent.textContent = '';
	}

	// 取得用于定位的节点。在绑定了each, with属性的元素里，它的整个innerHTML都会视为一个子模板先行移出DOM树，
	// 然后如果它的元素有多少个（each）或键值对有多少双（with），就将它复制多少份(多少为N)，再经过扫描后，重新插入该元素中。
	// 这时该元素的孩子将分为N等分，每等份的第一个节点就是这个用于定位的节点，
	// 方便我们根据它算出整个等分的节点们，然后整体移除或移动它们。
	function getLocatedNode(parent, data, pos){
		if (data.startRepeat){
			var start = data.startRepeat, 
				end = data.endRepeat;
			for (var i = 0; i <= pos; i++){
				start = start.nextSibling;
				if (start == end) return end;
			}
			return start;
		} else {
			return parent.childNodes[data.group * pos] || null;
		}
	}

	// Create a proxy object for "repeat" and "each" executor, which contains some useful extensions properties and methods. 
	// (such as $index, $first, $last, $remove, $key, $val, $outer etc.)
	var watchEachOne = Object.from('$index,$first,$last');

    function createWithProxy(key, val, $outer) {
        var proxy = local.modelFactory({
            $key: key,
            $outer: $outer,
            $val: val
        }, 0, {
            $val: 1,
            $key: 1
        })
        proxy.$id = "$proxy$with" + Math.random()
        return proxy
    }

	function createEachProxy(index, item, data, last){
		var param = data.param || 'item';
		var source = {
			$index: index,
			$itemName: param,
			$outer: data.$outer,
			$first: index === 0,
			$last: index === last,
			$remove: function(){
				return data.getter().removeAt(proxy.$index);
			}
		};
		source[param] = item;

		var proxy = local.modelFactory(source, 0, watchEachOne);
		proxy.$id = '$proxy$' + data.type + Math.random();
		return proxy;
	}

	function removeView(node, group, n){
		var deep = group * (n || 1);
		var fragment = documentFragment.cloneNode(false);

		while (--deep >= 0){
			fragment.appendChild(node);
			node = node.nextSibling;
			if (!node) break;
		}
		return fragment;
	}

	//为each, with, repeat要循环的元素外包一个loop临时节点，controller的值为代理VM的$id
	function shimController(data, transation, spans, proxy){
		var tview = data.template.cloneNode(true)
		var id = proxy.$id
		var span = tview.firstChild
		if (!data.fastRepeat){
			span = document.createElement('aloop')
			span.style.display = 'none'
			span.appendChild(tview)
		}
		span.setAttribute(matched.controller, id)
		spans.push(span)
		transation.appendChild(span)
		local.VModels[id] = proxy
		function fn(){
			delete local.VModels[id]
			data.group = 1
			if (!data.fastRepeat){
				data.group = span.childNodes.length
				span.parentNode.removeChild(span)
				while (span.firstChild){
					transation.appendChild(span.firstChild)
				}
				if (fn.node !== void 0){
					fn.parent.insertBefore(transation, fn.node)
				}
			}
		}
		return span.patchRepeat = fn
	}

	var displayMap = Object.append(Object.from('a,abbr,b,span,strong,em,font,i,kbd', 'inline'), Object.from('div,h1,h2,h3,h4,h5,h6,section,p', 'block'));
	function parseDisplay(element){
		var display = dom.getStyle(element, 'display') || '', 
			name = element.tagName.toLowerCase();

		if (display !== 'none') return display;

		if (!displayMap[name]){
			var node = document.createElement(name);
			root.appendChild(node);
			displayMap[name] = display;
			root.removeChild(node);
			node = null;
		}

		return displayMap[name];
	}

	local.bindingExecutors = bindingExecutors;
	local.bindingHandlers = bindingHandlers;

})(anita);
(function(local){

	var finder = {},
		getAttributes,
		dom = local.dom,
		config = local.config,
		matched = config.matched,
		bindingHandlers = local.bindingHandlers;

	var rsplit = /[^, ]+/g;

	// http://www.w3.org/TR/html5/syntax.html#void-elements
	var ignoreTags = Object.from('area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea'.toUpperCase());

    function createBindings(bindings, vmodels){
        for (var i = 0, item; item = bindings[i++];){
            item.vmodels = vmodels;
            bindingHandlers[item.type](item, vmodels);

			// remove binding property
            if (item.evaluator && item.element && item.element.nodeType === 1) item.element.removeAttribute(item.name);
        }
        bindings.length = 0;
    }

	/**
	 * Find the order:
	 *
	 * 0: skip
	 * 1: env
	 * 2: important
	 * 3: controller
	 * 10: if
	 * 100: repeat
	 * 110: if-loop
	 * 970: attr
	 * 1500: with
	 * 2000: duplex
 	 */
	finder.tag = function(element, vmodels, node){
		var prefix = config.prefix;

		var a = element.getAttribute(prefix + 'skip');
		var b = element.getAttributeNode(prefix + 'env');
		var c = element.getAttributeNode(matched.important);
		var d = element.getAttributeNode(matched.controller);

		if (typeof a === 'string') return;

		if (node = b){
			var retain;
			node.value.replace(rsplit, function(item){
				if (retain) return;
				retain = local.env[item];
			});

			if (!retain){
				dom.destroy(element);
				return;
			}

			element.removeAttribute(node.name);
		}

		if (node = c || d){
			var vmodel = local.VModels[node.value];
			if (!vmodel) return;

			//important不包含父VM，controller相反
			vmodels = [vmodel].concat(c ? [] : vmodels);

			element.removeAttribute(node.name); //removeAttributeNode不会刷新[ai-controller]样式规则
			dom.removeClass(element, node.name);
		}

		this.attributes(element, vmodels); //扫描特性节点
	};

	finder.nodes = function(root, vmodels){
        var node = root.firstChild;

        while (node){
            var next = node.nextSibling;
            if (node.nodeType === 1) this.tag(node, vmodels);
            else if (node.nodeType === 3 && matched.expression.test(node.nodeValue)) this.text(node, vmodels);
            node = next;
        }
	};

	var priorityMap = {
		'if': 10,
		'repeat': 90,
		'with': 1500,
		'duplex': 2000
	};

	var splitted = Object.from('class');

	finder.attributes = function(element, vmodels){
		var bindings = [], 
			data = {}, 
			match;

		var attributes = getAttributes ? getAttributes(element) : element.attributes;

		for (var i = 0, attribute; attribute = attributes[i++];){
			if (attribute.specified){
				var name = attribute.name;
				if (match = name.match(matched.attribute)){
					var value = attribute.value, 
						type = match[1], 
						dir;

					data[name] = value;

					if (typeof bindingHandlers[type] === 'function'){
						var param = match[2] || '';
						var binding = {
							type: type,
							param: param,
							element: element,
							name: match[0],
							value: value,
							priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
						};

						if (type === 'if' && param.indexOf('loop') > -1){
							binding.priority += 100;
						}

						if (splitted[type] && value.indexOf(',') > 0){
							dir = value.split(',');
							binding.value = dir.shift();
						}

						if (vmodels.length){
							bindings.push(binding);
							if (type === 'widget') element.msData = element.msData || data;
							if (dir && dir.length){
								dir.forEach(function(value){
									var rebinding = Object.append({}, binding);
									rebinding.value = value;
									bindings.push(rebinding);
								});
								dir = null;
							}
						}
					}
				}
			}
		}

		bindings.sort(function(a, b){
			return a.priority - b.priority;
		});

		if (data[config.prefix + 'checked'] && data[config.prefix + 'duplex']){
			local.log('Same element inability to define both "checked" and "duplex" two expressions.');
		}

		var first = bindings[0] || {};
		switch (first.type){
			case 'if':
			case 'repeat':
				createBindings([first], vmodels);
				break;
			default:
				if (bindings.length) createBindings(bindings, vmodels);
				if (!ignoreTags[element.tagName] && matched.bind.test(element.innerHTML)) this.nodes(element, vmodels);
				break;
		}

		if (element.patchRepeat){
			element.patchRepeat();
			element.patchRepeat = null;
		}
	};


	var document = local.document,
		documentFragment = document.createDocumentFragment();

	finder.text = function(textNode, vmodels){
        var bindings = [], 
			tokens = this.expression(textNode.nodeValue);

        if (tokens.length){
            for (var i = 0, token; token = tokens[i++];){
                var node = document.createTextNode(token.value); //将文本转换为文本节点，并替换原来的文本节点
                if (token.expr){
                    var filters = token.filters;
                    var binding = {
                        type: 'text',
                        element: node,
                        value: token.value,
                        filters: filters
                    };
                    if (filters && filters.indexOf('html') !== -1){
                        filters.erase('html');
                        binding.type = 'html';
                        binding.count = 1;
                        if (!filters.length) delete bindings.filters;
                    }
                    bindings.push(binding); //收集带有插值表达式的文本
                }
                documentFragment.appendChild(node);
            }

            textNode.parentNode.replaceChild(documentFragment, textNode);

            if (bindings.length) createBindings(bindings, vmodels);
        }	
	};


	var reFilters = /\|\s*(\w+)\s*(\([^)]*\))?/g,
		r11a = /\|\|/g,
		r11b = /U2hvcnRDaXJjdWl0/g;

	finder.expression = function(expression){
		var tokens = [],
			value, start = 0,
			stop;

		var openTag = config.openTag,
			closeTag = config.closeTag;

		do {
			stop = expression.indexOf(openTag, start);
			if (stop === -1) break;

			value = expression.slice(start, stop);
			if (value) tokens.push({
				value: value,
				expr: false
			});

			start = stop + openTag.length;
			stop = expression.indexOf(closeTag, start);
			if (stop === -1) break;

			value = expression.slice(start, stop);
			if (value){ //处理{{ }}插值表达式
				var leach = [];
				if (value.indexOf('|') > 0){ // 抽取过滤器 先替换掉所有短路与
					value = value.replace(r11a, 'U2hvcnRDaXJjdWl0'); //btoa('ShortCircuit')
					value = value.replace(reFilters, function(c, d, e){
						leach.push(d + (e || ''));
						return '';
					})
					value = value.replace(r11b, '||'); //还原短路与
				}
				tokens.push({
					value: value,
					expr: true,
					filters: leach.length ? leach : null
				});
			}
			start = stop + closeTag.length;
		} while (1);

		value = expression.slice(start);
		if (value) tokens.push({
			value: value,
			expr: false
		});

		return tokens;
	};

	local.find = function(target, context, argument){
		target = target || local.root;
		argument = typeof target === 'string' ? 'expression' : argument || 'tag';
		return finder[argument](target, context != null ? Array.from(context) : []);
	};

})(anita);
(function(local){

	var locale = local.locale.get(),
		slice = Array.prototype.slice;

	function toInt(item){
		return parseInt(item, 10);
	}

	function padNumber(num, digits, trim){
		var neg = '';
		if (num < 0){
			neg = '-';
			num = -num;
		}
		num = '' + num;
		while (num.length < digits) num = '0' + num;
		if (trim) num = num.substr(num.length - digits);
		return neg + num;
	}

	function dateGetter(name, size, offset, trim){
		return function(date){
			var value = date['get' + name]();
			if (offset > 0 || value > -offset) value += offset;
			if (value === 0 && offset === -12) value = 12;
			return padNumber(value, size, trim);
		};
	}

	function dateStrGetter(name, shortForm){
		return function(date, formats){
			var value = date['get' + name]();
			var get = shortForm ? ('short' + name) : name;
			return formats[get][value];
		}
	}

	function timezoneGetter(date){
		var zone = -1 * date.getTimezoneOffset();
		var paddedZone = (zone >= 0) ? '+' : '';
		paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
		return paddedZone;
	}

	function ampmGetter(date, formats){
		return formats[date.getHours() < 12 ? 'am' : 'pm'];
	}

	var DATE_FORMATS = {
		yyyy: dateGetter('FullYear', 4),
		yy: dateGetter('FullYear', 2, 0, true),
		y: dateGetter('FullYear', 1),
		MMMM: dateStrGetter('Month'),
		MMM: dateStrGetter('Month', true),
		MM: dateGetter('Month', 2, 1),
		M: dateGetter('Month', 1, 1),
		dd: dateGetter('Date', 2),
		d: dateGetter('Date', 1),
		HH: dateGetter('Hours', 2),
		H: dateGetter('Hours', 1),
		hh: dateGetter('Hours', 2, -12),
		h: dateGetter('Hours', 1, -12),
		mm: dateGetter('Minutes', 2),
		m: dateGetter('Minutes', 1),
		ss: dateGetter('Seconds', 2),
		s: dateGetter('Seconds', 1),
		sss: dateGetter('Milliseconds', 3),
		EEEE: dateStrGetter('Day'),
		EEE: dateStrGetter('Day', true),
		a: ampmGetter,
		Z: timezoneGetter
	};

	var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/, 
		NUMBER_STRING = /^\d+$/;

	var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
						// 1        2       3         4          5          6          7          8  9     10      11

	function jsonStringToDate(string, match){
		if (match = string.match(R_ISO8601_STR)){
			var date = new Date(0),
				tzHour = 0,
				tzMin = 0,
				dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
				timeSetter = match[8] ? date.setUTCHours : date.setHours;

			if (match[9]){
				tzHour = toInt(match[9] + match[10]);
				tzMin = toInt(match[9] + match[11]);
			}

			dateSetter.call(date, toInt(match[1]), toInt(match[2]) - 1, toInt(match[3]));

			var h = toInt(match[4] || 0) - tzHour;
			var m = toInt(match[5] || 0) - tzMin;
			var s = toInt(match[6] || 0);
			var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
			timeSetter.call(date, h, m, s, ms);

			return date;
		}
		return string;
	}

	var rfixFFDate = /^(\d+)-(\d+)-(\d{4})$/;
	var rfixIEDate = /^(\d+)\s+(\d+),(\d{4})$/;

	// XSS Filter RegExp
	var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim;
	var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
	var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig;
	var rspecialtags = {
		a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
		img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
		form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
	};

	var filters = local.filters = {

		/**
		 *  'abc' => 'ABC'
		 */
		upper: String.toUpperCase,

		/**
		 *  'AbC' => 'abc'
		 */
		lower: String.toLowerCase,

		/**
		 *  'abc' => 'Abc'
		 */
		capitalize: String.capitalize,

		/**
		 *  '<div>abc</div>' => '&lt;div&gt;abc&lt;/div&gt;'
		 */
		escape: function(html){
			return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},

		/**
		 * 'abcefgh' => 'abc...'
		 */
		truncate: function(target, length, truncation){
			//length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
			length = length || 30;
			truncation = truncation === void(0) ? '...' : truncation;
			return target.length > length ? target.slice(0, length - truncation.length) + truncation : String(target);
		},

		/**
		 *  args: an array of strings corresponding to
		 *  the single, double, triple ... forms of the word to
		 *  be pluralized. When the number to be pluralized
		 *  exceeds the length of the args, it will use the last
		 *  entry in the array.
		 *
		 *  e.g. ['single', 'double', 'triple', 'multiple']
		 */
		pluralize: function(value){
			var args = slice.call(arguments, 1);
			return args.length > 1 ? (args[value - 1] || args[args.length - 1]) : (args[value - 1] || args[0] + 's');
		},

		/**
		 *  12345 => $12,345.00
		 */
		currency: function(number, symbol){
			symbol = symbol || '$';
			return symbol + this.number(number, 2);
		},

		// https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
		// 	<a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a> 
		// 	<a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
		// 	<a href="jav	ascript:alert('XSS');">IE67chrome</a>
		// 	<a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
		// 	<a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
		xss: function(html){
			return html.replace(rscripts, '').replace(ropen, function(str){
				var match = str.toLowerCase().match(/<(\w+)\s/);
				if (match){
					var regexp = rspecialtags[match[1]];
					if (regexp){
						str = str.replace(regexp, function(property, name, value){
							var quote = value.charAt(0);
							return name + '=' + quote + 'javascript:void(0)' + quote;
						});
					}
				}
				return str.replace(ron, ' ').replace(/\s+/g, ' ');
			});
		},

		//与PHP的number_format完全兼容
		//number	必需，要格式化的数字
		//decimals	可选，规定多少个小数位。
		//dec_point	可选，规定用作小数点的字符串（默认为 . ）。
		//thousands_sep	可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
		// http://kevin.vanzonneveld.net
		number: function(number, decimals, dec_point, thousands_sep){
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '');

			var n = !isFinite(+number) ? 0 : +number,
				prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
				sep = thousands_sep || ',',
				dec = dec_point || '.',
				s = '',
				toFixed = function(n, prec){
					var k = Math.pow(10, prec);
					return '' + Math.round(n * k) / k;
				};

			// Fix for IE parseFloat(0.55).toFixed(0) = 0 
			s = (prec ? toFixed(n, prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3) s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);

			if ((s[1] || '').length < prec){
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}

			return s.join(dec);
		},

		date: function(date, format){
			var text = '',
				parts = [],
				fn, match;

			format = format || 'mediumDate';
			format = locale[format] || format;

			if (typeof date === 'string'){
				if (NUMBER_STRING.test(date)){
					date = toInt(date);
				} else {
					var trimDate = date.trim();
					if (trimDate.match(rfixFFDate) || trimDate.match(rfixIEDate)){
						date = RegExp.$3 + '/' + RegExp.$1 + '/' + RegExp.$2;
					}
					date = jsonStringToDate(date);
				}
				date = new Date(date);
			}

			if (typeof date === 'number') date = new Date(date);

			if (local.type(date) !== 'date') return;

			while (format){
				match = DATE_FORMATS_SPLIT.exec(format);
				if (match){
					parts = parts.concat(match.slice(1));
					format = parts.pop();
				} else {
					parts.push(format);
					format = null;
				}
			}

			parts.forEach(function(value){
				fn = DATE_FORMATS[value];
				text += fn ? fn(date, locale) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
			});

			return text;
		}

	};

	local.filter = function(name, fn){
		if (filters[name]) throw 'Filter "' + name + '" is existing.';
		filters[name] = fn;
	}.overloadSetter();

})(anita);
(function(local, window){

	var dom = local.dom;
	var defer = local.defer;
	var nextTick = defer.frame;

	var prefix = local.config.prefix;

	var enterClass = prefix + 'enter';
	var leaveClass = prefix + 'leave';

	var supportTransition = window.TransitionEvent || window.MozTransitionEvent;
	var supportWebKitTransition = !supportTransition && window.WebKitTransitionEvent;

	var supportAnimation = window.AnimationEvent;
	var supportWebKitAnimation = !supportAnimation && window.WebKitAnimationEvent;

	var transitionEvent = supportTransition ? 'transitionend' : 
		supportWebKitTransition ? 'webkitTransitionEnd' : null;

	var animationEvent = supportAnimation ? 'animationend' : 
		supportWebKitAnimation ? 'webkitAnimationEnd' : null;

	var transitionDuration = supportWebKitTransition ? 'webkitTransition' : 'transition';
	var animationDuration = supportWebKitAnimation ? 'webkitAnimation' : 'animation';

	transitionDuration += 'Duration';
	animationDuration += 'Duration';

	var fx = {};

	local.fx = function(name, def){
		if (!fx[name]) fx[name] = def;
	};

	local.transition = function(element, stage, fn){
		var data = element.fxData;

		if (!data || !data.initial){
			fn();
			defer(function(){
				var data = element.fxData;
				if (data) data.initial = 1;
			});
			return;
		}

		var def = fx[data.transition];

		var execute = def ? applyTransitionFunctions : 
			transitionEvent ? applyTransitionClass : null;

		execute ? execute(element, stage, fn, def || data) : fn();
	};

	function getTransitionType(element, classes, data){
		var type = data[classes];
		if (type != null) return type;

		var styles = element.style,
			computed = window.getComputedStyle(element);

		return data[classes] = parseFloat(styles[transitionDuration] || computed[transitionDuration]) > 0 ? 1 :
			parseFloat(styles[animationDuration] || computed[animationDuration]) > 0 ? 2 : 0;
	}

	/**
	 *  Togggle a CSS class to trigger transition.
	 */
	function applyTransitionClass(element, stage, fn, data){
		var leave = leaveClass, 
			enter = enterClass,
			classes = stage ? enter : leave,
			type;

		var rollback = function(){
			dom.removeListener(element, data.event, data.bound);
			data.event = data.bound = null;
		};

		var bound = function(event){
			if (event.target === element){
				rollback();
				clean();
			}
		};

		var clean = function(){
			!stage && fn();
			dom.removeClass(element, classes);
		};

		var defn = function(){
			data.bound = bound;
			data.event = type === 1 ? transitionEvent : animationEvent;
			dom.addListener(element, data.event, bound);
		};

		if (data.bound){
			rollback();
			dom.removeClass(element, enter);
			dom.removeClass(element, leave);
		}

		dom.addClass(element, classes);
		stage && fn();

		type = getTransitionType(element, classes, data);
		if (stage && type === 1){
			defn = function(){
				var h = document.body.offsetHeight;
				nextTick(clean);
			};
		}

		if (!type) defn = clean;

		defn();
	}

	function applyTransitionFunctions(element, stage, callback, def){
		var enter = def.enter,
			leave = def.leave,
			execute = stage ? enter : leave, ret;

		if (def.cancel) def.cancel();

		if (typeof execute !== 'function'){
			callback();
			return;
		}

		ret = execute(element, callback, defer);

		if (!def.cancel && ret){
			if (typeof ret === 'function') def.cancel = ret;
			else if (ret.cancel) def.cancel = ret.cancel;
		}
	}

})(anita, window);