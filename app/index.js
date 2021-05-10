'use strict';

const Hapi = require('@hapi/hapi');
const neo4j = require('neo4j-driver');

const driver = neo4j.driver('neo4j://neo_dest/neo4j', neo4j.auth.basic('neo4j', 'test'));
const session = driver.session();

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({ 
			method: 'GET', 
			path: '/', 
			handler: (request, h) => {
				return 'Hello Neo4j!';
      }
    });

		server.route({ 
			method: 'GET',
			path: '/all_actors',
			handler: async (request, h) => {
				try {
					const result = await session.run('MATCH (n:Person) RETURN n.name as name');
					const actors = result.records.map(rec => rec.get('name'));
					return actors;
				} catch (e) {
					return h.response('Sth went wrong').code(500);
				}
			}
		});

		server.route({ 
			method: 'POST',
			path: '/actors_filter_born',
			handler: async (request, h) => {
				try {
					const payload = request.payload;
					const result = await session.run(`MATCH (n:Person) WHERE n.born = ${payload.born} RETURN n.name as name`);
					const actors = result.records.map(rec => rec.get('name'));
					return actors;
				} catch (e) {
					return h.response('Sth went wrong').code(500);
				}
			}
		});

		server.route({ 
			method: 'GET',
			path: '/all_actors_nmb',
			handler: async (request, h) => {
				try {
					const result = await session.run('MATCH (n:Person) RETURN COUNT(n) AS qty');
					const numberOfActors = result.records[0].get('qty');
					return numberOfActors;
				} catch (e) {
					return h.response('Sth went wrong').code(500);
				}
			}
		});

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
