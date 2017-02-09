//******************************************************************************//
//                                                                              //
//                                                         :::      ::::::::    //
//    app.js                                             :+:      :+:    :+:    //
//                                                     +:+ +:+         +:+      //
//    By: gtorresa <gtorresa@student.42.fr>          +#+  +:+       +#+         //
//                                                 +#+#+#+#+#+   +#+            //
//    Created: 2017/02/08 10:29:23 by gtorresa          #+#    #+#              //
//    Updated: 2017/02/08 15:29:23 by gtorresa         ###   ########.fr        //
//                                                                              //
//******************************************************************************//

var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require ('body-parser');
var cookieParser = require('cookie-parser');

var config_serv = {
	app: express(),
	ip_serveur: '0.0.0.0',
	debug: true,
	client: {},
    arp_client: {},
	port_http: 8080,
	web_domain_site: 'https://network.onlineterroir.com',
};

config_serv.app.use(bodyParser.json());
config_serv.app.use(bodyParser.urlencoded({ extended: false }));
config_serv.app.use(cookieParser());
config_serv.app.use(express.static(path.join(__dirname, 'public')));

var server_http = http.createServer(config_serv.app);

console.log('Start arp-node-engine serveur on url : %s', config_serv.web_domain_site);
server_http.listen(config_serv.port_http, config_serv.ip_serveur, function () {
    console.log('Server_http listening at port %d', config_serv.port_http);
});

var io = require('socket.io').listen(process.env.VIRTUAL_NODE_PORT || server_http);
console.log('socket.io listening at port %d', process.env.VIRTUAL_NODE_PORT || config_serv.port_http);

io.on('connection', function (socket) {
    socket.on('connect', function () {
        console.log("connect");
    });
    socket.on('login', function (data) {
        console.log("Login action");
        if (data.type == "arp_client")
        {
            console.log("login arp_client");
            socket.client_name = data.hostname;
            config_serv.arp_client[socket.id] = socket;
        }
        else if (data.type == "client")
        {
            console.log("login client");
            config_serv.client[socket.id] = socket;
        }
    });
    socket.on('scan_arp', function (data) {
        console.log(data);
        if (!config_serv.arp_client[socket.id])
            config_serv.arp_client[socket.id] = {};
        config_serv.arp_client[socket.id].arp_scan = data;
    });
    socket.on('disconnect', function () {
        console.log("disconnect");
        for(var key in  config_serv.client)
        {
            if (key == socket.id)
                delete config_serv.client[key];
        }
        for(var key in  config_serv.arp_client)
        {
            if (key == socket.id)
                delete config_serv.arp_client[key];
        }
    });
});

setInterval(function(){
    var list_arp_scan = [];
    for (var key in config_serv.arp_client)
    {
        if (config_serv.arp_client[key].arp_scan)
            list_arp_scan.push(config_serv.arp_client[key].arp_scan);
    }
    for (var key in config_serv.client)
    {
        config_serv.client[key].emit('arp-discover', list_arp_scan);
    }
    console.log("Broadcast emit ", list_arp_scan);
}, 10000);

