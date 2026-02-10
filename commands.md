# Commands

## Install OpenFortiVPN

```bash
sudo apt update
sudo apt install openfortivpn
```

## Create a Configuration File

```bash
sudo mkdir -p /etc/openfortivpn
sudo nano /etc/openfortivpn/config
```

```bash
sudo nano /etc/openfortivpn/config
```

**Updated config:**
```
### configuration file for openfortivpn, see man openfortivpn(1) ###
host = sslvpn.loomis.com.tr
port = 443
username = veli.kara
password = gK1kiEK0
trusted-cert = 8d5ad97841c961eac8b24d8b8af12f55cb2be2b492d4d98423b73fa40a5e578e

# DNS settings
set-dns = 1
pppd-use-peerdns = 1

# Logging
use-syslog = 1
pppd-log = /var/log/openfortivpn-pppd.log

# Important: Set routes
set-routes = 1

# Optional: Increase timeout if connection is slow
persistent = 0
```

- Secure the config file:

```bash
sudo chmod 600 /etc/openfortivpn/config
sudo chown root:root /etc/openfortivpn/config
sudo openfortivpn -c /etc/openfortivpn/config
```

## Set Up as a Systemd Service 

```bash
sudo nano /etc/systemd/system/openfortivpn.service
```

```bash
[Unit]
Description=OpenFortiVPN Client
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
ExecStart=/usr/bin/openfortivpn -c /etc/openfortivpn/config --pppd-use-peerdns=1 --pppd-log=/var/log/openfortivpn-pppd.log
ExecStop=/usr/bin/pkill openfortivpn
Restart=on-failure
RestartSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable openfortivpn
sudo systemctl start openfortivpn
# Verify connection
sudo systemctl status openfortivpn
sudo openfortivpn -c /etc/openfortivpn/config -v

```

ssh -L 10443:sslvpn.loomis.com.tr:443 -N -f root@31.210.93.93

autossh -M 20000 -L 10443:sslvpn.loomis.com.tr:443 -N root@31.210.93.93

