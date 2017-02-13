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

var fs = require('fs');
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
	port_http: process.env.VIRTUAL_PORT || 8080,
	web_domain_site: 'https://network.onlineterroir.com',
	local_discover: JSON.parse(fs.readFileSync('data/all_discovered.json') || '{}'),
	local_options: JSON.parse(fs.readFileSync('data/options.json') || '{}')
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

function shutdown(signal, value) {
	console.log('server stopped by ' + signal);
	console.log('save all_discovered');
	if (fs.existsSync('data/all_discovered.json'))
		format_data_to_save(get_arp_scan_formated(make_list_arp_scan()), false);
	if (fs.existsSync('data/options.json'))
		fs.writeFileSync('data/options.json', JSON.stringify(config_serv.local_options));
	process.exit(128 + value);
}

var signals = {
	'SIGINT': 2,
	'SIGTERM': 15
};

Object.keys(signals).forEach(function (signal) {
	process.on(signal, function () {
		shutdown(signal, signals[signal]);
	});
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
			socket.token_register = data.token;
			config_serv.arp_client[socket.id] = socket;
		}
		else if (data.type == "client")
		{
			console.log("login client");
			config_serv.client[socket.id] = socket;
			socket.emit('arp-discover', get_arp_scan_formated(make_list_arp_scan()));
		}
	});
	socket.on('scan_arp', function (data) {
		console.log(data);
		if (!config_serv.arp_client[socket.id])
			config_serv.arp_client[socket.id] = {};
		if (config_serv.local_options.remote_token[socket.token_register])
			config_serv.arp_client[socket.id].arp_scan = data;
		else
			console.log("Unregister remote " + socket.id + " " + socket.conn.remoteAddress);
	});
	socket.on('register_scan_arp', function (data) {
		register_arp_client(data, socket);
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

function makeid()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 12; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function register_arp_client(data, socket)
{
	if (data == config_serv.local_options.master_token)
	{
		var arp_token = {};
		arp_token.id = makeid();
		arp_token.valid = true;
		config_serv.local_options.remote_token[arp_token.id] = true;
		fs.writeFileSync('data/options.json', JSON.stringify(config_serv.local_options));
		socket.emit("return_register", arp_token);
		console.log("Client register");
	}
	else
	{
		var arp_token = {};
		arp_token.valid = false;
		console.log("Error: Client register, wrong master token");
		socket.emit("return_register", arp_token);
	}
}

function format_data_to_save(list_arp_scan, connected)
{
	var save_format = {};
	//MASTER
	for (var key in list_arp_scan.children)
	{
		//REMOTE
		save_format[list_arp_scan.children[key].name] = {};
		for (var key1 in list_arp_scan.children[key].children)
		{
			//INTERACE
			save_format[list_arp_scan.children[key].name][list_arp_scan.children[key].children[key1].name] = {};
			for (var key2 in list_arp_scan.children[key].children[key1].children)
			{
				//HOST
				list_arp_scan.children[key].children[key1].children[key2].connected = connected;
				save_format[list_arp_scan.children[key].name][list_arp_scan.children[key].children[key1].name][list_arp_scan.children[key].children[key1].children[key2].ip] = list_arp_scan.children[key].children[key1].children[key2];
			}
		} 
	}
	if (!connected)
	{
		fs.writeFileSync('data/all_discovered.json', JSON.stringify(save_format));
		config_serv.local_discover = save_format;
	}
	return (save_format);
}

function merge_savediscover_scan(list_arp_scan, local_discover)
{
	config_serv.remote_con = {};
	config_serv.iface_con = {};
	for (var key in local_discover)
	{
		//REMOTE
		if (!list_arp_scan[key])
		{
			list_arp_scan[key] = local_discover[key];
			config_serv.remote_con[key] = true;
		}
		for (var key1 in local_discover[key])
		{
			//INTERFACE
			if (!list_arp_scan[key][key1])
			{
				list_arp_scan[key][key1] = local_discover[key][key1];
				config_serv.iface_con[key1] = true;
			}
			if (config_serv.remote_con[key])
				config_serv.iface_con[key1] = true;
			for (var key2 in local_discover[key][key1])
			{
				//HOST
				if (!list_arp_scan[key][key1][key2])
					list_arp_scan[key][key1][key2] = local_discover[key][key1][key2];
			}
		}
	}
	return (list_arp_scan);
}

function format_data_to_use(curent_list)
{
	var list_arp_save = curent_list;
	var list_arp_scan = {};
	list_arp_scan.name = "MASTER";
	list_arp_scan.children = [];
	for (var key in list_arp_save)
	{
		var remote = {
			name: key,
			children: [],
			connected: true
		};
		if (config_serv.remote_con[key])
			remote.connected = false;
		for (var key1 in list_arp_save[key])
		{
			var iface = {
				name: key1,
				children: [],
				connected: true
			};
			if (config_serv.iface_con[key1])
				iface.connected = false;
			for (var key2 in list_arp_save[key][key1])
			{
				iface.children.push(list_arp_save[key][key1][key2]);
			}
			remote.children.push(iface);
		}
		list_arp_scan.children.push(remote);
	}
	return (list_arp_scan);
}

function make_list_arp_scan()
{
	var list_arp_scan = {};
	list_arp_scan.name = "MASTER";
	list_arp_scan.children = [];
	for (var key in config_serv.arp_client)
	{
		if (config_serv.arp_client[key].arp_scan)
			list_arp_scan.children.push(config_serv.arp_client[key].arp_scan);
	}
	return (list_arp_scan);
}

function get_arp_scan_formated(list_arp_scan)
{
	var new_list_arp_scan = format_data_to_use(merge_savediscover_scan(format_data_to_save(list_arp_scan, true), config_serv.local_discover));
	for (var key in list_arp_scan.children)
	{
		new_list_arp_scan.children[key].time = list_arp_scan.children[key].time;
		for (var key1 in new_list_arp_scan.children[key].children)
		{
			if (list_arp_scan.children[key].children[key1])
			{
				new_list_arp_scan.children[key].children[key1].type = list_arp_scan.children[key].children[key1].type;
				new_list_arp_scan.children[key].children[key1].ip_address = list_arp_scan.children[key].children[key1].ip_address;
				new_list_arp_scan.children[key].children[key1].gateway_ip = list_arp_scan.children[key].children[key1].gateway_ip;
				new_list_arp_scan.children[key].children[key1].netmask = list_arp_scan.children[key].children[key1].netmask;
			}
		}
	}
	new_list_arp_scan.connected = true;
	return new_list_arp_scan;
}

setInterval(function(){
	var merge_list_arp_scan = get_arp_scan_formated(make_list_arp_scan());
	for (var key in config_serv.client)
	{
		config_serv.client[key].emit('arp-discover', merge_list_arp_scan);
	}
	console.log("Broadcast emit ", merge_list_arp_scan);
	format_data_to_save(merge_list_arp_scan, false);
}, 10000);