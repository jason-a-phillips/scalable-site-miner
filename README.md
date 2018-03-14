# autoscaling-realtime-miner

The goal of this application is to create the proof of concept for an autoscaling cluster of Node.js workers, managed by a Node.js controller and backed by a Postgres database, that mine new data from HTTP sources every minute. 

The idea is that a definition of work (template) could be provided to the controller which would then distribute work to available workers. As new work and/or new workers are added, the controller will automatically redistribute work to workers.

The problem that this design overcomes is that one Node.js service cannot discover new content from very many HTTP sources every minute. HTTP responses and the subsequent requests for detailed meta data simply take too long, in the range of many seconds to complete. This is very slow, so to maintain one-minute freshness of our data and not have similar jobs collide, the work must be distributed to many workers. 

The application right now is a tightly-coupled cluster, due to the relationship the Node.js services have with the database. many workers, one controller and one database will scale up to the point where the Postgres database becomes a problem. Then a potential next step to increase scalability would be to insert an API in front of the database and scale the database with replication, document storage or "NoSQL" solutions, etc.


