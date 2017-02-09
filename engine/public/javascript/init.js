/**
 * Created by omega on 2/8/17.
 */
$(function() {
    var coef = 0.95,
        width = coef * $(window).width(),
        height =  coef * $(window).height();
    var diameter =  coef * $(window).height();
    var duration = 350;

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    socket.emit('login', {type: "client"});

    var pubs = {};

    socket.on('arp-discover', function(data){
        console.log(data);
        root = data;
        update(root);
    });

    var i = 0,
        root,
        _link,
        _node;


    d3.selectAll("input").on("change", change);

    function change() {
        if (this.value === "radialtree")
            transitionToRadialTree();
        else if (this.value === "radialcluster")
            transitionToRadialCluster();
        else if (this.value === "tree")
            transitionToTree();
        else
            transitionToCluster();
    }

    function transitionToRadialTree() {

        var nodes = tree.nodes(root), // recalculate layout
            links = tree.links(nodes),
            link = d3.selectAll("path.link"),
            node = d3.selectAll("g.node");

        svg.transition().duration(duration)
            .attr("transform", "translate(" + (width/2) + "," +
                (height/2) + ")");
        // set appropriate translation (origin in middle of svg)

        link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#fc8d62")
            .attr("d", radialDiagonal); //get the new radial path

        node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                return d.connected?"#4daf4a":"#e41a1c";
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

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function(d){
                return d.connected?"#4daf4a":"#e41a1c";
            })
            .style('fill', function(d){
                return d._children?"#166511":"#fff";
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
                return "translate(" + d.y + "," + d.x + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function () {
                return "rotate(0)";
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", "#377eb8");

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
                return "translate(" + d.y + "," + d.x + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function () {
                return "rotate(0)";
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", "#e41a1c");

    }


    var tree = d3.layout.tree()
        .size([360, (diameter / 2) - 80])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 10) / a.depth; });

    var diagonalcluster = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var cluster = d3.layout.cluster()
        .size([height, width-120]);

    var radialTree = d3.layout.tree()
        .size([height, width-120]);

    var radialCluster = d3.layout.cluster()
        .size([360, (diameter / 2) - 80 ])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
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
    update(root);

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 80; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeExit = node.exit().remove();
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            //.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 6)
            .style("fill", function(d) { return d._children ? "blue" : "#fff"; })
            .style("stroke-width", 3);

        nodeEnter.append("text")
            .attr("x", 10)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            //.attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name.length * 8.5)  + ")"; })
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
                var o = {x: source.x0, y: source.y0};
                return diagonalcluster({source: o, target: o});
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

        update(d);
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