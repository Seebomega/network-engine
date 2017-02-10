/**
 * Created by omega on 2/8/17.
 */
$(function() {
    var coef = 0.95,
        width = $(window).width(),
        height =  coef * $(window).height();
    var diameter =  coef * $(window).height();
    var duration = 1500;

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    socket.emit('login', {type: "client"});

    var pubs = {name: "MASTER"};

    socket.on('arp-discover', function(data){
        console.log(data);
        root = data;
        root.x0 = height / 2;
        root.y0 = width/2;
        update(root, false);
    });

    var root,
        _link,
        _node;


    function createNotif(d){
        var notifClass = "success";
        var message = "";
        if(d.mac && d.mac.length>1){
            notifClass = "warning";
            message = "IP conflict on " + d.mac.join("-");
        }
        else{
            if(d.connected){
                message = d.name + "Has connected"
            }
            else{
                notifClass = "alert";
                message = d.name + "Has disconnected"
            }
        }

        var html = '<div data-alert class="alert-box '+notifClass+' round">'+
                    message+
                    '<a href="#" class="close">&times;</a>'+
                '</div>';

        $('body').append();
    }

    function transitionToRadialTree() {

        var nodes = tree.nodes(root), // recalculate layout
            links = tree.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(" + (width/2) + "," +
                (height/2) + ")");
        // set appropriate translation (origin in middle of svg)

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#fc8d62")
            .attr("d", radialDiagonal); //get the new radial path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                if(!d.children) {
                    return (d.x < 180) ? "translate(0)" : "rotate(180)translate(-20)";
                }
                else{
                    return (d.x >= 180) ? "rotate(180)translate(0)":"translate(0)";
                }
            })
            .attr("text-anchor", function(d) {
                if(!d.children){
                    return (d.x >= 180) ? "end" : "start";
                }
                else{
                    return "start";
                }

            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                createNotif(d);
                if(d.mac && d.mac.length > 1){
                    return "#E8A526";
                }
                else{
                    return d.connected?"#4daf4a":"#e41a1c";
                }

            })
            .style('fill', function(d){
                if(d._children){
                    return "#000";
                }
                else{
                    return d.docker?"#408FBD":"#fff";
                }

            });

    }

    function transitionToRadialCluster() {

        var nodes = radialCluster.nodes(root), // recalculate layout
            links = radialCluster.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(" + (width/2) + "," +
                (height/2) + ")");
        // set appropriate translation (origin in middle of svg)

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#66c2a5")
            .attr("d", radialDiagonal); //get the new radial path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                if(!d.children) {
                    return (d.x < 180) ? "translate(0)" : "rotate(180)translate(-20)";
                }
                else{
                    return (d.x >= 180) ? "rotate(180)translate(0)":"translate(0)";
                }
            })
            .attr("text-anchor", function(d) {
                if(!d.children){
                    return (d.x >= 180) ? "end" : "start";
                }
                else{
                    return "start";
                }

            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                createNotif(d);
                if(d.mac && d.mac.length > 1){
                    return "#E8A526";
                }
                else{
                    return d.connected?"#4daf4a":"#e41a1c";
                }

            })
            .style('fill', function(d){
                if(d._children){
                    return "#000";
                }
                else{
                    return d.docker?"#408FBD":"#fff";
                }

            });

    }

    function transitionToTree() {

        var nodes = radialTree.nodes(root), //recalculate layout
            links = radialTree.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(40,0)");

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#e78ac3")
            .attr("d", diagonalcluster); // get the new tree path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return d.children? "rotate(-90)":"rotate(-60)";

            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                createNotif(d);
                if(d.mac && d.mac.length > 1){
                    return "#E8A526";
                }
                else{
                    return d.connected?"#4daf4a":"#e41a1c";
                }

            })
            .style('fill', function(d){
                if(d._children){
                    return "#000";
                }
                else{
                    return d.docker?"#408FBD":"#fff";
                }

            });

    }

    function transitionToCluster() {

        var nodes = cluster.nodes(root), //recalculate layout
            links = cluster.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(40,0)");

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#8da0cb")
            .attr("d", diagonalcluster); //get the new cluster path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y+ ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return d.children? "rotate(-90)":"rotate(-60)";
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                createNotif(d);
                if(d.mac && d.mac.length > 1){
                    return "#E8A526";
                }
                else{
                    return d.connected?"#4daf4a":"#e41a1c";
                }

            })
            .style('fill', function(d){
                if(d._children){
                    return "#000";
                }
                else{
                    return d.docker?"#408FBD":"#fff";
                }

            });

    }


    var tree = d3.layout.tree()
        .size([360, (diameter / 2) - 80])
        .separation(function(a, b) {
            return 50;
        });

    var diagonalcluster = d3.svg.diagonal()
        .projection(function (d) {
            return [d.x, d.y];
        });

    var cluster = d3.layout.cluster()
        .size([width-70, height-10]);

    var radialTree = d3.layout.tree()
        .size([width-70, height-10]);

    var radialCluster = d3.layout.cluster()
        .size([360, (diameter / 2) - 80 ])
        .separation(function(a, b) {
            return 50;
        });

    var radialDiagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg = d3.select("body").append("svg")
        .attr("width", width )
        .attr("height", height )
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    root = pubs;
    root.x0 = height / 2;
    root.y0 = width/2;

//root.children.forEach(collapse); // start with all children collapsed
    update(root, false);
    d3.selectAll("input").on("change", function(){
        update(root , true);
    });

    function update(source, updateText) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 50; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = md5(d.name + d.ip + (d.name!="MASTER"? d.parent.name:"")));
            });

        var nodeExit = node.exit().remove();
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", click);

        if(updateText){
            node.selectAll("text")
                .attr("transform", "rotate(0)translate(0)")
                .attr("text-anchor", "start");
        }


        nodeEnter.append("circle")
            .attr("r", 6)
            .style("fill", function(d) { return d._children ? "blue" : "#fff"; })
            .style("stroke-width", 3);

        nodeEnter.append("text")
            .attr("x", 10)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .style("fill-opacity", 1);


        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        var linkExit = link.exit().remove();
        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonalcluster({source: o, target: o});
            })
            .style("stroke-width", function(d){
                return (1/(d.source.depth+1))*3 + 'px';
            });


        _link = link;
        _node = node;

        var form = $("input:checked").val();

        if (form === "radialtree")
            transitionToRadialTree();
        else if (form === "radialcluster")
            transitionToRadialCluster();
        else if (form === "tree")
            transitionToTree();
        else
            transitionToCluster();
    }

// Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }

        update(d, false);
    }

// Collapse nodes
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(
            );
            d.children = null;
        }
    }
});