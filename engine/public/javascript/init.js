/**
 * Created by omega on 2/8/17.
 */
$(function () {
    var coef = 0.95,
        width = $(window).width(),
        height = coef * $(window).height();
    var diameter = coef * $(window).height();
    var duration = 1500;

    var collapsed = [];

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    var url_split = window.document.URL.split('/');
    var url = url_split[2];
    var socket = io.connect(url, {secure: true});

    socket.emit('login', {type: "client"});

    var initData = {name: "MASTER"};

    socket.on('arp-discover', function (data) {
        $('.alert-box').animate({
            opacity: 0,
            right: "-=500"
        }, 800, function () {
            this.remove();
        });
        notifs = 0;
        console.log(data);
        collapse(data, data.name);
        root = data;
        root.x0 = height / 2;
        root.y0 = width / 2;
        update(root, false);

    });

    var notifs = 0,
        tour = 0,
        root,
        _link,
        _node;


    function createNotif(d) {
        if (tour != 0) {
            var notifClass = "success";
            var message = "";
            var currentNotif = notifs;

            if (d.mac && d.mac.length > 1) {
                notifs++;
                notifClass = "warning";
                message = "IP conflict on " + d.mac.join(" / ");
            }
            else {
                if (d.connected) {
                    return false;
                }
                else {
                    notifs++;
                    notifClass = "alert";
                    message = d.name + " Is disconnected"
                }
            }

            var html = '<div data-alert class="alert-box ' + notifClass + ' round" style="min-width:280px;position:absolute;display:block;top:' + 55 * currentNotif + 'px;right:0;z-index:-1">' +
                message +
                '<a href="#" class="close">&times;</a>' +
                '</div>';

            $(html).hide().appendTo('body').fadeIn(2000);
        }
    }

    function transitionToRadialTree() {

        var nodes = tree.nodes(root), // recalculate layout
            links = tree.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(" + (width / 2) + "," +
                (height / 2) + ")");
        // set appropriate translation (origin in middle of svg)

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#fc8d62")
            .attr("d", radialDiagonal); //get the new radial path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                if (d.children || d._children) {
                    return (d.x >= 180) ? "rotate(180)translate(-10)" : "translate(-50)";
                }
                else {
                    return (d.x < 180) ? "translate(0)" : "rotate(180)translate(-20)";
                }
            })
            .attr("text-anchor", function (d) {
                if (d.children || d._children) {
                    return (d.x >= 180) ? "start" : "end";
                }
                else {
                    return (d.x >= 180) ? "end" : "start";
                }
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function (d) {
                if (d.mac && d.mac.length > 1) {
                    return "#E8A526";
                }
                else {
                    return d.connected ? "#4daf4a" : "#e41a1c";
                }

            })
            .style('fill', function (d) {
                if (d._children) {
                    return "#CCC";
                }
                else {
                    return d.docker ? "#408FBD" : "#fff";
                }

            });

    }

    function transitionToRadialCluster() {

        var nodes = radialCluster.nodes(root), // recalculate layout
            links = radialCluster.links(nodes);

        svg.transition().duration(duration)
            .attr("transform", "translate(" + (width / 2) + "," +
                (height / 2) + ")");
        // set appropriate translation (origin in middle of svg)

        _link.data(links)
            .transition()
            .duration(duration)
            .style("stroke", "#66c2a5")
            .attr("d", radialDiagonal); //get the new radial path

        _node.data(nodes)
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                if (d.children || d._children) {
                    return (d.x >= 180) ? "rotate(180)translate(-10)" : "translate(-50)";
                }
                else {
                    return (d.x < 180) ? "translate(0)" : "rotate(180)translate(-20)";
                }
            })
            .attr("text-anchor", function (d) {
                if (d.children || d._children) {
                    return (d.x >= 180) ? "start" : "end";
                }
                else {
                    return (d.x >= 180) ? "end" : "start";
                }
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function (d) {
                if (d.mac && d.mac.length > 1) {
                    return "#E8A526";
                }
                else {
                    return d.connected ? "#4daf4a" : "#e41a1c";
                }

            })
            .style('fill', function (d) {
                if (d._children) {
                    return "#CCC";
                }
                else {
                    return d.docker ? "#408FBD" : "#fff";
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
                return d.children ? "rotate(-90)" : "rotate(-60)";

            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function (d) {
                if (d.mac && d.mac.length > 1) {
                    return "#E8A526";
                }
                else {
                    return d.connected ? "#4daf4a" : "#e41a1c";
                }

            })
            .style('fill', function (d) {
                if (d._children) {
                    return "#CCC";
                }
                else {
                    return d.docker ? "#408FBD" : "#fff";
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
                return "translate(" + d.x + "," + d.y + ")";
            });

        _node.select("text")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return d.children ? "rotate(-90)" : "rotate(-60)";
            });

        _node.select("circle")
            .transition()
            .duration(duration)
            .style("stroke", function (d) {
                if (d.mac && d.mac.length > 1) {
                    return "#E8A526";
                }
                else {
                    return d.connected ? "#4daf4a" : "#e41a1c";
                }

            })
            .style('fill', function (d) {
                if (d._children) {
                    return "#CCC";
                }
                else {
                    return d.docker ? "#408FBD" : "#fff";
                }

            });

    }


    var tree = d3.layout.tree()
        .size([360, (diameter / 2) - 80])
        .separation(function (a, b) {
            return 50;
        });

    var diagonalcluster = d3.svg.diagonal()
        .projection(function (d) {
            return [d.x, d.y];
        });

    var cluster = d3.layout.cluster()
        .size([width - 70, height - 10]);

    var radialTree = d3.layout.tree()
        .size([width - 70, height - 10]);

    var radialCluster = d3.layout.cluster()
        .size([360, (diameter / 2) - 80])
        .separation(function (a, b) {
            return 50;
        });

    var radialDiagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    root = initData;
    root.x0 = height / 2;
    root.y0 = width / 2;

    d3.selectAll("input").on("change", function () {
        update(root, true);
    });

    function update(source, updateText) {
        if (tour == 0) {
            tour++;
        }
        // Compute the new tree layout.
        var nodes = tree.nodes(root),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 50;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                var retId = d.id || (d.id = md5(d.name + d.ip_address + (d.name != "MASTER" ? d.parent.name : "")));
                return retId;
            });

        var nodeExit = node.exit().remove();
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", click)
            .on("mouseenter", function (d) {
                $('.pricing-table').remove();
                var pos = getPos(parseInt(d3.event.pageX), parseInt(d3.event.pageY));
                if (!d.alias) {
                    d.alias = "";
                }
                var html = '<ul class="pricing-table" style="z-index:999;overflow-y:auto;max-height:250px;position:absolute;top:' + pos.y + 'px;left:' + pos.x + 'px;">';

                html += '<li class="bullet-item" style="text-align:left;padding: 6px;"><b>Alias : </b>'+
                    '<input type="text" class="alias" style="padding:0;margin:0;width: 75%;display: inline-block;" id="alias-' + d.id + '" value="' + d.alias + '" /></li>';
                $.each(d, function (key, value) {
                    var unwantedKeys = ["name", "parent", "children", "_children", "x", "y", "id", "depth", "x0", "y0", "alias"];
                    if ($.inArray(key, unwantedKeys) == -1) {
                        if (key == "docker") {
                            html += '<li class="bullet-item" style="text-align:left;padding: 6px;"><b>' + key + ' :</b> <i class="fa fa-docker fa-2x" style="color:' + (value ? "#4daf4a" : "#e41a1c") + ';vertical-align: middle;"></i></li>';
                        }
                        else if (key == "connected") {

                            var ico = value ? "check-square" : "window-close";
                            var color = value ? "#4daf4a" : "#e41a1c";

                            html += '<li class="bullet-item" style="text-align:left;padding: 6px;"><b>' + key + ' :</b> <i class="fa fa-' + ico + '" style="color:' + color + ';vertical-align: middle;"></i></li>';
                        }
                        else {
                            html += '<li class="bullet-item" style="text-align:left;padding: 6px;"><b>' + key + ' :</b> ' + value + '</li>';
                        }

                    }
                });
                html += '</ul>';
                $('body').append(html);
                d3.event.stopPropagation();
                $('.pricing-table').on("mouseleave", function () {
                    this.remove();
                });
                $('.alias').on("keyup", function(){
                    delay(function(){
                        d.alias = $('.alias').val();
                        updateAlias(d);
                    }, 500 );
                });
            });

        if (updateText) {
            node.selectAll("text")
                .attr("transform", "rotate(0)translate(0)")
                .attr("text-anchor", "start");
        }


        nodeEnter.append("circle")
            .attr("r", function (d) {
                return (d.children || d._children) ? 14 : 6;
            })
            .style("fill", function (d) {
                return d._children ? "blue" : "#fff";
            })
            .style("stroke-width", 3);

        nodeEnter.append("text")
            .attr("x", function (d) {
                return (d.children || d._children) ? 30 : 10;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function (d) {
                return d.name;
            })
            .style("fill-opacity", 1);


        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        var linkExit = link.exit().remove();
        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {x: source.x, y: source.y};
                return diagonalcluster({source: o, target: o});
            })
            .style("stroke-width", function (d) {
                return (1 / (d.source.depth + 1)) * 3 + 'px';
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

    function getPos(x, y) {
        if ((y + 200) > height) {
            y -= Math.abs(height - (y + 200));
        }

        if ((x + 180) > width) {
            x -= Math.abs(width - (x + 180));
        }

        return {
            x: x + 10,
            y: y
        };

    }

// Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            collapsed.push(d.id);

        } else {
            d.children = d._children;
            d._children = null;
            collapsed.splice($.inArray(d.id, collapsed), 1);
        }

        update(d, false);
    }

// Collapse nodes
    function collapse(d, name) {
        createNotif(d);
        if (d.children) {
            //console.log(d.name, name, md5(d.name + d.ip_address + (d.name != "MASTER" ? name : "")), collapsed);
            if ($.inArray(md5(d.name + d.ip_address + (d.name != "MASTER" ? name : "")), collapsed) != -1) {
                d._children = d.children;
                d.children = null;
            }
            else {
                d.children.forEach(function (f) {
                    collapse(f, d.name);
                });
            }

        }
    }

    function updateAlias(d){
        var posObject = {
            remote: null,
            iface: null,
            host: null
        };
        switch (d.depth){
            case 0:
                console.log("MASTER");
                break;
            case 1:
                posObject.remote = d.name;
                break;
            case 2:
                posObject.remote = d.parent.name;
                posObject.iface = d.name;
                break;
            case 3:
                posObject.remote = d.parent.parent.name;
                posObject.iface = d.parent.name;
                posObject.host = d.name;
                break;
        }

        socket.emit('update_alias', posObject, "ALIAS", d.alias);
    }

    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();
});