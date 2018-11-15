### clone
JavaScript之深拷贝和浅拷贝
## 前言
工作中会经常遇到操作数组、对象的情况，你肯定会将原数组、对象进行‘备份’
当真正对其操作时发现备份的也发生改变，此时你一脸懵逼，到时是为啥，不是已经备份了么，怎么备份的数组、对象也会发生变化。
如果你对拷贝原理理解的不透彻，此文或许能提供一点帮助。

## javascript数据类型
# 基本数据类型
string、number、null、undefined、boolean、symbol(ES6新增) 变量值存放在栈内存中，可直接访问和修改变量的值
基本数据类型不存在拷贝，好比如说你无法修改数值1的值

# 引用类型
Object Function RegExp Math Date 值为对象，存放在堆内存中
在栈内存中变量保存的是一个指针，指向对应在堆内存中的地址。
当访问引用类型的时候，要先从栈中取出该对象的地址指针，然后再从堆内存中取得所需的数据

## 浅拷贝
为什么备份的数组对象也会发生变化，这里就涉及到你用的‘备份’其实是一种浅拷贝

# 简单的引用拷贝
```bash
var a = [1,2,3,4];
var b = a;
a[0] = 0;
console.log(a,b);//(4) [0, 2, 3, 4] (4) [0, 2, 3, 4]
```


可以看到数组a直接赋值给b，a、b引用的其实是一个对象地址，只要地址值发生变化，a、b栈内存指针指向的堆地址也会发生变化，这种引用拷贝只是新增了一个变量栈内存的指针，意义不大

# 数组的concat、slice，对象的assign拷贝
同样的例子
```bash
var a = [1,2,3,4];
var b = a.concat();
a[0] = 0;
console.log(a,b);//(4) [0, 2, 3, 4] (4) [1, 2, 3, 4]
```

此时数组a[0]值变成0，b数组依然保持不变，有同学就问了，这不就是深拷贝吗。

对，也不对， Array.prototype.slice 和 Array.prototype.concat 看似深拷贝，其实质上还是浅拷贝
```bash
var a = [1,2,[3,4],{name:'ccy'}];
var b = a.concat();
a[3].name = 'hs';
console.log(a[3],b[3]);//{name: "hs"} {name: "hs"}
```

当数组a中包含对象时， Array.prototype.slice 和 Array.prototype.cancat 拷贝出来数组中的对象还是共享同一内存地址，所以本质上归属浅拷贝

 Object.assign 原理也是一样的（对于对象的属性都为基本类型可以当成深拷贝）
```bash
var a = {age:18,name:'ccy',info:{address:'wuhan',interest:'playCards'}};
var b = Object.assign(a);
a.info.address = 'shenzhen';
console.log(a.info,b.info);//{address: "shenzhen", interest: "playCards"} {address: "shenzhen", interest: "playCards"}
```

那怎样才能对对象进行深拷贝呢，请扶好眼镜。

自己写一个深拷贝函数

```bash
var clone = function(obj){
        var construct = Object.prototype.toString.call(obj).slice(8,-1);
        var res;
        if(construct === 'Array'){
            res = [];
        }else if(construct === 'Object'){
            res = {}
        }
        for(var item in obj){
            if(typeof obj[item] === 'object'){
                res[item] = clone(obj[item]);
            }else{
                res[item] = obj[item];
            }
        }
        return res;
    };
```
乍一看好像能处理对象的属性为对象的问题，可以循环遍历直至属性为基本类型；

但是仔细想，如果遇到对象的属性存在相互引用的话会出现死循环的情况。可以再加一次判断，对象的属性如果引用对象指针则跳出当前循环。

## 深拷贝
深拷贝是可以完美的解决浅拷贝的弊端，重新开辟一块地址，深拷贝出来的属性的基本类型值都是相同的。

# JSON内置对象深拷贝
 JSON 对象是ES5中引入的新的类型（支持的浏览器为IE8+），JSON对象parse方法可以将JSON字符串反序列化成JS对象，stringify方法可以将JS对象序列化成JSON字符串，借助这两个方法，也可以实现对象的深拷贝
```bash
var a = {age:1,name:'ccy',info:{address:'wuhan',interest:'playCards'}};
var b = JSON.parse(JSON.stringify(a));
a.info.address = 'shenzhen';
console.log(a.info,b.info);//{address: "shenzhen", interest: "playCards"} {address: "wuhan", interest: "playCards"}
```

 JSON 可处理一般的对象进行深拷贝，但是不能处理函数、正则等对象

 我们可以对自定义的拷贝函数再进行优化
 # 深拷贝函数
 ```bash
 var clone = function(obj){
        function getType(obj){
            return Object.prototype.toString.call(obj).slice(8,-1);
        }
        function getReg(a){
            var c = a.lastIndexOf('/');
            var reg = a.substring(1,c);
            var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\w': '\\w', '\s': '\\s', '\d': '\\d'};
            for(var i in escMap){
                if(reg.indexOf(i)){
                    reg.replace(i,escMap[i]);
                }
            }
            var attr = a.substring(c+1);
            return new RegExp(reg, attr);
        }
        var construct = getType(obj);
        var res;
        if(construct === 'Array'){
            res = [];
        }else if(construct === 'Object'){
            res = {}
        }
        for(var item in obj){
            if(obj[item] === obj) continue;//存在引用则跳出当前循环
            if(getType(obj[item]) === 'Function'){
                res[item] = new Function("return "+obj[item].toString())();
            }else if(getType(obj[item]) === 'RegExp'){
                res[item] = getReg(obj[item].toString());
            }else if(getType(obj[item]) === 'Object'){
                res[item] = clone(obj[item]);
            }else{
                res[item] = obj[item];
            }
        }
        return res;
    };
var a = {age:1,name:'ccy',info:{address:'wuhan',interest:'playCards'},f:function(str){console.log(str)},reg:/a\w\s/gi};
var b = clone(a);
console.log(a.f,b.f,a.f===b.f);//ƒ (str){console.log(str)} ƒ (str){console.log(str)} false
console.log(a.reg,b.reg,a.reg===b.reg);///a\w\s/gi /a\w\s/gi false
 ```
基本可以实现函数、正则对象的深拷贝，在本地只做了简单的测试，如果存在问题，请及时评论指出。

当然像函数库 lodash 的 _.cloneDeep、 JQuery 的 $.extend都实现了深拷贝，有兴趣的同学可自行看下源码。
