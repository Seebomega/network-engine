[logo]: http://img15.hostingpics.net/pics/46883535ex.png "Example Image"

## Synopsis

Network-Engine aggregates data from remotes and produces an awesome web visualization for your network.

 
![alt text][logo]

See if hosts are Connected/disconnected, IP conflicts, DNS names, HostNames, IP, mac, DockerRunning ...
Set aliases to your hosts/nodes.

## How it works

See remote Project (http://link) for more precise explaination.

Remote are `docker-compose up` in differents sub-nets or you can mount different interfaces in different sub-nets.
After that, the remote can ask `arp -scan` to see your differents machines connected.
The remote also ask (with configuration) DNS server and/or isc-dhcp-server to get more informations

Engine aggregates datas from remote(s) and keep a cache json of all machines found and can say if they are up or down

You can remove machines/interfaces to watch
You can modify the pulling request of remotes


## Installation

Pull the project.

Edit the `docker-compose.yml` file as you wish (80 Port require `privileged: true`) and volume the file for configuration:

For example : `engine/data/options.json` << _Here you have the master Token(generated at first run) to register your remotes_

Exec: `docker build -t network-engine .`

Exec: `docker-compose up`

Now you have the Master node on `http://localhost`

Configure the Network-remote see: http://Link

Get the Master Token from the `options.json` and register your remotes with `docker exec -ti network-remote register $MASTERTOKEN`



## Motivation

As passionated friends of internet, 
We allied our Network-knowledge and Live vizualisations of data to build a simple tool.
We decided to build a tool to help people to see their networks (Companies, associations, geeks ...). 
It's like a monitoring tool for your network but you can easyly see new devices, IP conflicts etc ...
And ... for fun, we have to admit it.



## Contributors

Pitzzae, gtorresa@student.42.fr @pitzzae
SeebOmega, sderoche@maltem.com  @Seebomega


## License

MIT