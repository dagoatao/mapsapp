# mapsapp

Demo app using [leafletjs](http://leafletjs.com) open source mapping framework, [JQuery](https://jquery.com), [JQuery-UI](https://jqueryui.com), [node.js](https://nodejs.org/en/), [rethinkdb](https://rethinkdb.com), [express](https://expressjs.com).

General purpose mapping micro-app with the ability to add map-markers, map-polygons, map-polylines. Save those objects into rethinkdb. And view maps and map-objects by selecting a saved map.

Can be easily extended for a variety of needs.

1. Download repository ^^
2. From the command line:
```
npm install  
```
3. Start rethinkdb on command line:
```
rethinkdb
```
4. Start mapsapp forever:
```
forever server.js
```
5. Open up a webbrowser for location http://localhost:4200

##RethinkDB
Rethinkdb requires a seperate download for mac or windows. It is not installed with npm. You can find instructions [here](https://rethinkdb.com/docs/quickstart/).
