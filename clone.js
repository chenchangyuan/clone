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
