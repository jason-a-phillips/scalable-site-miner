# Overview
The goal of this application is to create the proof of concept for an auto-balancing cluster of Node.js nodes, managed by a Node.js control plane and backed by a Postgres data store. The intended use of this application is to scrape web sites at scale and speed. This infrastructure will discover content on sites like social media, news and online forums less than one minute after the content is posted, thus being almost real-time.

The central idea is that JSON templates, which contains everythig necessary to find information on a site, are provided to the control plane which assigns this work to available nodes. As new work and/or new nodes are added, the control plane will automatically redistribute the work to nodes.

The problem that this design addresses is that one Node.js node cannot scrape new content from a large number of sources (i.e., greater than 20) and still maintain the one-minute level of data freshness. The initial HTTP response and subsequent requests for links' meta data simply take too long to complete, sometimes 10+ seconds. To maintain one-minute freshness of our data and not have similar jobs collide, the work must be distributed to many nodes. 

The application right now is a tightly-coupled cluster, due to the relationship between the Node.js services and the database. This will scale to the point where Postgres becomes the bottleneck. To increase scalability, we might insert an API in front of the database and scale the database with replication, document storage or NoSQL solutions, etc.

# Running the application
## Requirements
* Node JS
* Docker

1. Start the Docker Postgres database container using the provided Docker commands. It uses port 5432, so make sure that doesn't conflict with Postgres that might be locally installed. Adjust the port number as needed in the application in the Docker run command and the two pg-connector.js connection objects.
2. Insert a template for a job into the database. Use the dummy-data.sql file to insert a job that mines the Hacker News site.
3. Start the control plane service in /control-plane with "node .".
4. Start node(s) in /node with "node .".

# Explanation of the application
1. When you start the control plane, it first looks for any nodes that have registered themselves as being alive. 
2. The control plane checks their status and sets them to "active" if they just registered themselves and have no work assigned to them yet. 
3. The control plane will count how many active nodes exist, compare it to the previous count and equally distribute jobs to each active node. 
4. When you start a node (you can start as many nodes as you like), it gives itself a unique identity and registers itself with the controller as being alive.
5. It checks with the control plane to see when it has been assigned work.
6. The node will execute its tasks every minute and log completion of its assigned tasks.
7. If the node fails to check in, the control plane will deactivate that node and redistribute work to the active remaining node.

# Design
The Node.js services are designed to maximize Node's event-loop model and asynchronous "next tick" behavior. HTTP and database requests are always wrapped in Promises, batched and throttled using concurrency limits. As work grows, adding more nodes should be a trivial task, until the database becomes the bottleneck.

# To-do's
1. Refactor long large functions into smaller ones
2. Add features to clean up stale, useless data like disabled node records.
3. Add code to auto-grow nodes from within the Node.js control plane itself.
4. Containerize these services within Docker.
5. Insert an API in front of the database.
6. Create a simple React JS application to view the data in interesting ways.
