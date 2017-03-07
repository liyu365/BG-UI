!(function () {

    var options = {
        openTag: '{{',
        closeTag: '}}',
        syntax_hook: null
    };

    var methods = {
        $foreach: function (data, callback) {
            if (Object.prototype.toString.call(data) === '[object Array]') {
                for (var i = 0, len = data.length; i < len; i++) {
                    callback.call(data, data[i], i);
                }
            } else {
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        callback.call(data, data[k], k);
                    }
                }
            }
        },
        $toString: function (value) {
            if (typeof value !== 'string') {
                var type = typeof value;
                if (type === 'number') {
                    value += '';
                } else if (type === 'function') {
                    value = methods.$toString(value.call(value));
                } else {
                    value = '';
                }
            }
            return value;
        },
        $escape: function (content) {
            var escapeMap = {
                "<": "&#60;",
                ">": "&#62;",
                '"': "&#34;",
                "'": "&#39;",
                "&": "&#38;"
            };
            return methods.$toString(content).replace(/&(?![\w#]+;)|[<>"']/g, function (match) {
                return escapeMap[match];
            });
        },
        $trim: function (str) {
            if (typeof str !== 'string') {
                return '';
            }
            return str.replace(/^\s*|\s*$/g, '');
        },
        $include: function (id, data) {
            return catpl(id)(data);
        }
    };

    var helpers = {}; //存放辅助函数

    var cache = {}; //缓存，只缓存根据元素id获取的模板文件所生成的函数

    //提取模板字符串中的变量名和方法名
    var getVariable = function (code) {
        var KEYWORDS =
            // 关键字
            'break,case,catch,continue,debugger,default,delete,do,else,false'
            + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
            + ',throw,true,try,typeof,var,void,while,with'
                // 保留字
            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
            + ',final,float,goto,implements,import,int,interface,long,native'
            + ',package,private,protected,public,short,static,super,synchronized'
            + ',throws,transient,volatile'
                // ECMA 5 - use strict
            + ',arguments,let,yield'
            + ',undefined';

        return code
            .replace(/\/\*[\w\W]*\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"[^"]*"|'[^']*'|\s*\.\s*[$\w\.]+/g, '') //去除字符串中的js注释，js字符串，去除对象的属性(例如obj.xxx中的.xxx)
            .replace(/[^$\w]+/g, ',')  //去除a-zA-Z_&以外的所有字符，并且转化为逗号(转化为逗号是为了分隔开所有的变量名或方法名)，注意_和&为合法的变量名或方法名，因此要保留
            .replace(new RegExp("\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b", 'g'), '') //去除所有js中的关键字和保留字
            .replace(/^\d[^,]*|,\d[^,]*/g, '') //去除单独使用的数字，这里加入对逗号的判断是为了以免去除变量或方法名中的数字
            .replace(/^,+|,+$/g, '')  //去除字符串前后多余的逗号
            .split(/,+/);  //根据逗号把字符串分隔为数组，最终得到一个由合法变量名组成的数组
    };


    //分析模板字符串并翻译成js代码，最后由Function构造函数实例化成一个真正的js函数
    var compile = function (tpl) {
        var source = tpl.replace(/^\s*|\s*$/g, '');

        //处理模板字符串中的html部分
        var handle_html = function (code) {
            if (code) {
                /**
                 * 在此对html片段进行转义的原因：
                 * 1)因为在最终翻译好的代码字符串中需要通过单引号来连接所有html片段到$cat变量中，所以把html片段中的单引号转义
                 * 2)把真实的转义字符再进行转义变为字面上的转义字符
                 * 3)把真实的换行符转换成字面上的'\r'和字面上的的'\n'
                 */
                code = "$cat+='" + code.replace(/('|\\)/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "';";
            }
            return code + '\n';
        };

        //处理模板字符串中的逻辑语句
        var handle_logic = function (code) {
            //调用语法钩子
            if (typeof options.syntax_hook == 'function') {
                code = options.syntax_hook(code);
            }
            //翻译形如 <%=name%> <%=#name> 的值输出语句
            if (code.indexOf('=') === 0) {
                var needEscape = !/^=#/.test(code);
                code = code.replace(/^=#?/g, '').replace(/^\s*|\s*$|;/g, '');
                if (needEscape) {
                    code = '$escape(' + code + ')';
                } else {
                    code = '$toString(' + code + ')';
                }
                code = '$cat+=' + code + ';';
            }
            //提取模板中的变量名，函数名，并在code_header中添加对应的变量声明语句
            methods.$foreach(getVariable(code), function (name) {
                if (!name || buffer[name]) {
                    return;
                }
                var val = '';
                if(name ==='$cat'){
                    return;
                }else if (name === 'include') {
                    val = "function(id,data){var data=data||$data;var txt=$methods.$include(id,data);$cat+=txt;}";
                } else if (methods[name]) {
                    val = "$methods." + name;
                } else if (helpers[name]) {
                    val = "$helpers." + name;
                } else {
                    val = "$data." + name
                }
                buffer[name] = true;
                code_header += name + "=" + val + ",";
            });

            return methods.$trim(code) + '\n';
        };

        var code_header = "'use strict'; var ";
        var code_body = '';
        var code_footer = "return $cat;";
        var buffer = {};

        //开始解析
        methods.$foreach(source.split(options.openTag), function (code) {
            var arr = code.split(options.closeTag);
            if (arr.length === 1) {
                code_body += handle_html(arr[0]);
            } else {
                code_body += handle_logic(arr[0]);
                if (arr[1]) {
                    code_body += handle_html(arr[1]);
                }
            }
        });

        var code = code_header + "$cat='';\n" + code_body + code_footer;
        code = "try{\n" + code + "\n}catch(e){if(typeof console === 'object'){console.error(e);}return 'catpl error'}";
        //console.log(code);
        var fun = new Function("$data", "$methods", "$helpers", code);
        return function (data) {
            return fun(data, methods, helpers);
        };
    };

    var catpl = function (tpl) {
        if (cache[tpl]) {
            return cache[tpl];
        }
        var element = null;
        if (typeof window.document !== 'undefined') {
            element = document.getElementById(tpl);
        }
        if (element) {
            var source = (element.value || element.innerHTML);
            var fn = compile(source);
            cache[tpl] = fn;
            return fn;
        }
        return compile(tpl);
    };

    catpl.config = function (conf, value) {
        var set = function (conf, value) {
            conf = methods.$trim(conf);
            options[conf] = /Tag$/.test(conf) ? methods.$trim(value) : value;
        };
        if (arguments.length === 2) {
            set(conf, value);
        } else if (arguments.length === 1 && Object.prototype.toString.call(conf) === '[object Object]') {
            for (var k in conf) {
                if (conf.hasOwnProperty(k)) {
                    set(k, conf[k]);
                }
            }
        }
        //console.log(options);
    };

    catpl.helper = function (name, fun) {
        helpers[name] = fun;
    };

    catpl.deleteCache = function (key) {
        if (typeof key === 'undefined') {
            cache = {};
        } else if (cache.hasOwnProperty(key)) {
            delete cache[key];
        }
    };

    //语法钩子函数
    options.syntax_hook = function (code) {
        code = methods.$trim(code);
        var frags = code.split(' ');
        var key = frags.shift();
        var args = frags.join(' ');
        var decorator = function (data, filter) {
            var arr = filter.split(':');  //根据冒号把filter字符串分割成数组，如果filter字符串中没有冒号则split()方法会返回只包含一个成员的数组，该成员为filter字符串
            var fn_name = arr.shift();  //数组中的第一个成员为函数名，获取后从原数组删除
            var args = arr.join('') || '';  //此时的arr形如["'param1, param2'"]或[]，用join方法把这个数组再变为字符串
            if (args) {
                args = ',' + args;
            }
            return fn_name + '(' + data + args + ')';
        };
        switch (key) {
            case 'if':
                code = 'if(' + args + '){';
                break;
            case 'else':
                //分为else if和else两种情况
                var txt;
                if (frags.shift() === 'if') {
                    txt = ' if(' + frags.join(' ') + ')';
                } else {
                    txt = '';
                }
                code = '}else' + txt + '{';
                break;
            case '/if':
                code = '}';
                break;
            case 'foreach':
                var object = frags[0] || '$data';
                var as = frags[1];
                var value = frags[2] || '$value';
                var index = frags[3] || '$index';
                var param = value + ',' + index;
                if (as && as !== 'as') {
                    object = '[]';
                }
                code = '$foreach(' + object + ',function(' + param + '){';
                break;
            case '/foreach':
                code = '});';
                break;
            case 'include':
                code = key + '(' + frags.join(',') + ');';
                break;
            default:
                if (/^\s*\|\s*[\w\$]/.test(args)) {
                    var escape = true;
                    if (code.indexOf('#') === 0) {
                        code = code.substr(1);
                        escape = false;
                    }
                    var array = code.split('|');
                    var val = methods.$trim(array[0]);
                    for (var i = 1, len = array.length; i < len; i++) {
                        val = decorator(val, methods.$trim(array[i]));
                    }
                    code = (escape ? '=' : '=#') + val;
                } else {
                    code = '=' + code;
                }
                break;
        }
        return code;
    };

    if (typeof define === 'function') {
        define(function () {
            return catpl;
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = catpl;
    } else {
        this.catpl = catpl;
    }

})();