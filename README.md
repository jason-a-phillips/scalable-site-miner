# Overview
The goal of this application is to create the proof of concept for an auto-balancing cluster of Node.js workers, managed by a Node.js controller and backed by a Postgres data store. The intended use of this application is to find new information posted on sites like social media, news and online forums less than one minute after the content is posted, thus being almost real-time.

The central idea is that JSON templates, which contains everythig necessary to find information on a site, are provided to the controller which assigns this work to available workers. As new work and/or new workers are added, the controller will automatically redistribute the work to workers.

The problem that this design addresses is that one Node.js worker service cannot mine new content from a large number of sources (i.e., greater than 20) and still maintain the one-minute level of data freshness. The initial HTTP response and subsequent requests for links' meta data simply take too long to complete, sometimes 10+ seconds. To maintain one-minute freshness of our data and not have similar jobs collide, the work must be distributed to many workers. 

The application right now is a tightly-coupled cluster, due to the relationship between the Node.js services and the database. This will scale to the point where Postgres becomes the bottleneck. To increase scalability, we might insert an API in front of the database and scale the database with replication, document storage or NoSQL solutions, etc.

# Running the application
## Requirements
* Node JS
* Docker

1. Start the Docker Postgres database container using the provided Docker commands. It uses port 5432, so make sure that doesn't conflict with Postgres that might be locally installed. Adjust the port number as needed in the application in the Docker run command and the two pg-connector.js connection objects.
2. Insert a template for a job into the database. Use the dummy-data.sql file to insert a job that mines the Hacker News site.
3. Start the controller service in /controller with "node .".
4. Start worker(s) in /worker with "node .".

# Explanation of the application
1. When you start the controller, it first looks for any workers that have registered themselves as being alive. 
2. The controller checks their status and sets them to "active" if they just registered themselves and have no work assigned to them yet. 
3. The controller will count how many active workers exist, compare it to the previous count and equally distribute jobs to each active worker. 
4. When you start a worker (you can start as many workers as you like), it gives itself a unique identity and registers itself with the controller as being alive.
5. It checks with the controller to see when it has been assigned work.
6. The worker will execute its tasks every minute and log completion of its assigned tasks.
7. If the worker fails to check in, the controller will deactivate that worker and redistribute work to the active remaining workers.

# Design
The Node.js services are designed to maximize Node's event-loop model and asynchronous "next tick" behavior. HTTP and database requests are always wrapped in Promises, batched and throttled using concurrency limits. As work grows, adding more workers should be a trivial task, until the database becomes the bottleneck.

# To-do's
1. Refactor long large functions into smaller ones
2. Add features to clean up stale, useless data like disabled worker records.
3. Add code to auto-grow worker services from within the Node.js controller itself.
4. Containerize these services within Docker.
5. Insert an API in front of the database.
6. Create a simple React JS application to view the data in interesting ways.
