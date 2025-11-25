export const commands = [
  { cmd: 'whoami', out: 'shelnet' },
  { cmd: 'ip a | grep inet', out: 'inet 10.0.0.42/24 brd 10.0.0.255 scope global eth0\n   inet 127.0.0.1/8 scope host lo' },
  { cmd: 'nslookup shelnet.org', out: 'Server:  1.1.1.1\nAddress: 1.1.1.1#53\n\nNon-authoritative answer:\nName: shelnet.org\nAddress: 203.0.113.11' },
  { cmd: 'dig +short A shelnet.org', out: '203.0.113.11' },
  { cmd: 'arp -a', out: '? (10.0.0.1) at 00:11:22:33:44:55 on eth0 [ether]\n? (10.0.0.42) at aa:bb:cc:dd:ee:ff on eth0 [ether]' },
  { cmd: 'ip route', out: 'default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.42' },
  { cmd: 'tcpdump -ni any port 53 -c 3', out: 'listening on any, link-type LINUX_SLL (Linux cooked v1), capture size 262144 bytes\nIP 10.0.0.42.50123 > 1.1.1.1.53: 1234+ A? shelnet.org. (29)\nIP 1.1.1.1.53 > 10.0.0.42.50123: 1234 1/0/0 A 203.0.113.11 (45)' },
  { cmd: 'traceroute shelnet.org', out: 'traceroute to shelnet.org (203.0.113.11), 30 hops max\n 1  10.0.0.1  1.123 ms\n 2  198.51.100.1  12.456 ms\n 3  203.0.113.11  18.901 ms' },
  { cmd: 'echo "Welcome to Shelnet — PBQs & Exams"', out: 'Welcome to Shelnet — PBQs & Exams' }
]

export const introText = `<span class='prompt'>shelnet@studio</span>:~$ cat shelnet-info.txt\nShelnet is a free study hub for IT students.\n\nWhat you'll find here:\n• Hands-on PBQs that load in-page (no deps)\n• A+ full-length practice exam\n• Clean, fast, terminal-inspired UI\n\nGoal: help you pass faster with targeted practice.\n`

