## Rudimentary approch to clearing ports and containers. 
sudo docker kill $(sudo docker ps -q)
sudo docker rm $(sudo docker ps -a -q)