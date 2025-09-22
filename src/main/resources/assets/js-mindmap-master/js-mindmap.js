$.fn.mindmap = function(){
    var container = $(this);
    container.css({"width": "100%", "height": "700px", "position":"relative"});
    var jsonObj = JSON.parse(container.html());
    var root = "";
    container.empty().append("<svg class='mindmap__svg' width='100%' height='500px'></svg>");
    var svg = container.find("svg");

    var nodeId = 1;
    var nodes = [];

    var nodeDistance = 200;
    var rootDistance = 250;

    drawRoot = function(key){
        container.append("<div class='mindmap__root mindmap__node' data-node='0'><div class='root__inner'>"+key+"</div></div>");
        root = container.find(".mindmap__root");
        var topPosition = 50 + "px";
        var leftPosition = ((container[0].clientWidth/2) - (root[0].clientWidth/2)) + "px";
        root.css({top: topPosition, left: leftPosition});
    };

    drawChild = function(key, parent){
        container.append("<div class='mindmap__node' data-node='"+nodeId+"' data-parent='"+parent+"'>"+key+"</div>");
        return nodeId++;
    }

    function Parse(obj, level, parent){
        for (var key in obj){
            if(level == 0){
                drawRoot(key);
                var parentId = 0;
            } else {
                var parentId = drawChild(key, parent);
            }
            if(nodes[parent] == undefined) nodes[parent] = [];
            nodes[parent].push(parentId);

            if(obj[key]){
                var newLevel = level + 1;
                Parse(obj[key], newLevel, parentId);
            }    
        }
    }

    calculatePosition = function(obj){
        return {
                x : obj.position().left + obj[0].clientWidth/2,
                y : obj.position().top + obj[0].clientHeight/2
            };
    }

    nodeSize = function(obj){
        return {
            width : obj[0].clientWidth,
            height : obj[0].clientHeight
        };
    }

    hideNodes = function(){
        $(".mindmap__node").each(function(){
            if($(this).data("node") != 0 && $(this).data("parent") != 0){
                $(this).hide();
                $("line[data-node='"+$(this).data("node")+"']").hide();
            }
        });
    }

    hasChilds = function(obj){
        if($(".mindmap__node[data-parent='"+obj.data("node")+"']").length){
            return true;
        } else {
            return false;
        }
    }

    showChilds = function(obj){
        if(obj.hasClass("active")){
            hideNodes();
            obj.removeClass("active");
        } else {
            if(hasChilds(obj)){
                hideNodes();
                $(".mindmap__node[data-parent='"+obj.data("node")+"']").show();
                $("line[data-parent='"+obj.data("node")+"']").show();
                $(".mindmap__node").removeClass("active");
                obj.addClass("active");
            }
        }
    }

    offsetAll = function(){
        var sT = $(".mindmap__root").css("top").replace(/[^-\d\.]/g, '');  
        var mT = 0;
        var lT = $(".mindmap__root").css("left").replace(/[^-\d\.]/g, '');  

        container.find("*").each(function(){
            if(Number($(this).css("top").replace(/[^-\d\.]/g, '')) < Number(sT)) sT = $(this).css("top").replace(/[^-\d\.]/g, '');
        });

        if(sT<50){
            container.find(".mindmap__node").each(function(){
                var currentTop = Number($(this).css("top").replace(/[^-\d\.]/g, ''));
                currentTop += Math.abs(sT) + 30;
                $(this).css({"top": currentTop+"px"});
            });
            container.find("line").each(function(){
                var newY1 = Number($(this).attr("Y1").replace(/[^-\d\.]/g, '')) + Math.abs(sT) + 30;
                var newY2 = Number($(this).attr("Y2").replace(/[^-\d\.]/g, '')) + Math.abs(sT) + 30;

                $(this).attr("y1", newY1+"px");
                $(this).attr("y2", newY2+"px");
            });
        }

        container.find("*").each(function(){
            if(Number($(this).css("left").replace(/[^-\d\.]/g, '')) < Number(lT)) lT = $(this).css("left").replace(/[^-\d\.]/g, '');
        });

        if(lT<50){
            container.find(".mindmap__node").each(function(){
                var currentLeft = Number($(this).css("left").replace(/[^-\d\.]/g, ''));
                currentLeft += Math.abs(lT) + 30;
                $(this).css({"left": currentLeft+"px"});
            });
            container.find("line").each(function(){
                var newX1 = Number($(this).attr("X1").replace(/[^-\d\.]/g, '')) + Math.abs(lT) + 30;
                var newX2 = Number($(this).attr("X2").replace(/[^-\d\.]/g, '')) + Math.abs(lT) + 30;

                $(this).attr("x1", newX1+"px");
                $(this).attr("x2", newX2+"px");
            });
        }

        container.find("*").each(function(){
            if(Number($(this).css("top").replace(/[^-\d\.]/g, '')) > Number(mT)) mT = $(this).css("top").replace(/[^-\d\.]/g, '');
        });

        container.find("svg").css({"height": (Number(mT)+50)+"px"});
    }

    connectionPoint = function(child, parent){
        if(parent.x == child.x || Math.abs(parent.x-child.x)<2){ //child directly above or below parent
            if(parent.y>child.y){ // child above parent
                return "da";
            } else { // child below parent
                return "db";
            }
        }else if(parent.y == child.y || Math.abs(parent.y-child.y)<2){ // child directly before or after parent
            if(parent.x<child.x){
                return "daf";
            } else {
                return "dbef";
            }
        } else if(parent.y < child.y) { // child below parent
            if(parent.x < child.x){ // after
                if(Math.abs(parent.y-child.y) < Math.abs(parent.x-child.x)){ // connect to side of node
                    return "belowafterside";
                } else { // connect to top of node
                    return "belowaftertop";
                }
            } else { // before
               if(Math.abs(parent.y-child.y) < Math.abs(parent.x-child.x)){ // connect to side of node
                    return "belowbeforeside";
                } else { // connect to top of node
                    return "belowbeforetop";
                } 
            }
        } else { // child above parent
            if(parent.x < child.x){ // after
                if(Math.abs(parent.y-child.y) < Math.abs(parent.x-child.x)){ // connect to side of node
                    return "aboveafterside";
                } else { // connect to top of node
                    return "aboveaftertop";
                }
            } else { // before
               if(Math.abs(parent.y-child.y) < Math.abs(parent.x-child.x)){ // connect to side of node
                    return "abovebeforeside";
                } else { // connect to bottom of node
                    return "abovebeforebottom";
                } 
            }
        }
    }


    drawLine = function(child, parent){
        parent.x = Math.floor(parent.x);
        parent.y = Math.floor(parent.y);
        var x1=y1=x2=y2=0;

        x1=parent.x;
        y1=parent.y;

        switch(connectionPoint(child, parent)){
            case "da":
                x2 = parent.x;
                y2 = child.y + child.height/2;
                y1 = parent.y - parent.height/2;
                break;
            case "db":
                x2 = parent.x;
                y2 = child.y - child.height/2;
                y1 = parent.y + parent.height/2;
                break;
            case "daf":
                y2 = child.y;
                x2 = child.x - child.width/2;
                x1 = parent.x + parent.width/2;
                break;
            case "dbef":
                y2 = child.y;
                x2 = child.x + child.width/2;
                x1 = parent.x - parent.width/2;
                break;
            case "belowafterside":
                y2 = child.y - child.height/2;
                x2 = child.x;
                y1 = parent.y+parent.height/2;
                break;
            case "belowaftertop":
                y2 = child.y - child.height/2;
                x2 = child.x;
                y1 = parent.y+parent.height/2;
                break;
            case "belowbeforeside":
                y2 = child.y - child.height/2;
                x2 = child.x;
                y1 = parent.y + parent.height/2;
                break;
            case "belowbeforetop":
                y2 = child.y - child.height/2;
                x2 = child.x;
                y1 = parent.y + parent.height/2;
                break;
            case "aboveafterside":
                y2 = child.y + child.height/2;
                x2 = child.x;
                y1 = parent.y - parent.height/2;
                break;
            case "aboveaftertop":
                y2 = child.y + child.height/2;
                x2 = child.x;
                y1 = parent.y - parent.height/2;
                break;
            case "abovebeforeside":
                x2 = child.x;
                y2 = child.y + child.height/2;
                y1 = parent.y - parent.height/2;
                break;
            case "abovebeforebottom":
                y2 = child.y + child.height/2;
                x2 = child.x;
                y1 = parent.y - parent.height/2;
                break;
        }

        if(parent.node == 0){
            x1 = parent.x;
            y1 = parent.y;
        }



        svg.append('<line data-node="'+child.node+'" data-parent="'+parent.node+'" x1="'+x1+'px" y1="'+y1+'px" x2="'+x2+'px" y2="'+y2+'px" style="stroke:rgb(255,0,0);stroke-width:2" />');
    }

    calculateOffsetAngle = function(node, qty){
        var parent = $(".mindmap__node[data-node='"+node.node+"']").data("parent");

        if(parent == undefined){
            return 0;
        }

        var parentObj = $(".mindmap__node[data-node='"+parent+"']");
        var parentJSON = {node: parent, x: calculatePosition(parentObj).x, y: calculatePosition(parentObj).y, width: nodeSize(parentObj).width, height: nodeSize(parentObj).height};    

        var offset = 0;

        switch(connectionPoint(node, parentJSON)){
                case "da":
                    offset =  -135;
                    break;
                case "db":
                    offset =  45;
                    break;
                case "daf":
                    offset =  -45;
                    break;
                case "dbef":
                    offset =  135;
                    break;
                case "belowafterside":
                    offset =  0;
                    break;
                case "belowaftertop":
                    offset =  0;
                    break;
                case "belowbeforeside":
                    offset =  90;
                    break;
                case "belowbeforetop":
                    offset =  90;
                    break;
                case "aboveafterside":
                    offset =  -90;
                    break;
                case "aboveaftertop":
                    offset =  -90;
                    break;
                case "abovebeforeside":
                    offset =  135;
                    break;
                case "abovebeforebottom":
                    offset =  135;
                    break;
            }

        if(qty>3){
            offset += qty*6;
        }

        return offset;
    }

    Parse(jsonObj, 0, false);

    for(var key in nodes){
        if(key !== "false"){
            var parent = key;
            var currentAngle = 0;
            for(var keyb in nodes[key]){

                var child = nodes[key][keyb];
                var parentPos = calculatePosition($(".mindmap__node[data-node='"+parent+"']"));
                var childObj = $(".mindmap__node[data-node='"+child+"']");
                var parentObj = $(".mindmap__node[data-node='"+parent+"']");

                var parentJSON = {node: parent, x: parentPos.x, y: parentPos.y, width: nodeSize(parentObj).width, height: nodeSize(parentObj).height};
                var offsetAngle = calculateOffsetAngle(parentJSON, nodes[key].length);

                var distance = 0;
                if(parent == 0) distance = rootDistance;
                else distance = nodeDistance;
                var cX = Math.floor(parentPos.x + distance * Math.cos((currentAngle+offsetAngle)*(Math.PI/180)));
                var cY = Math.floor(parentPos.y + distance * Math.sin((currentAngle+offsetAngle)*(Math.PI/180)));

                var childJSON = {node: child, x: Math.floor(cX), y: Math.floor(cY), width: nodeSize(childObj).width, height: nodeSize(childObj).height};
                drawLine(childJSON, parentJSON);

                var nodeX = cX - nodeSize(childObj).width/2;
                var nodeY = cY - nodeSize(childObj).height/2;

                childObj.css({top: nodeY+"px",left: nodeX+"px"});

                currentAngle += 45;
            }
        }
    }

    hideNodes();

    container.html(container.html());

    $(".mindmap__node").each(function(){
        $(this).on("click", function(){  
            showChilds($(this));
        });
    });

    offsetAll();
}

// load the mindmap
$(document).ready(function() {
    $(".mindmap").each(function(){
        $(this).mindmap();
    });
});   