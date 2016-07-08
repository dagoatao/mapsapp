var r = require("rethinkdb");
var express = require('express');
var bodyParser = require("body-parser");
var sockio = require("socket.io");
var fs = require("fs");

var connection = null;
r.connect({host:'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;

    console.log("checking for mapsapp database");
    r.dbList().contains('mapsapp').do(function(databaseExists) {
      return r.branch(databaseExists,
        {exists:1},
        r.dbCreate('mapsapp'));
    }).run(connection, function(err, results) {
      if (err) throw err;
      if (results.dbs_exists == 1) {
        console.log("mapsapp db exists");
      }
    });

    console.log("checking for maps table.");
    r.db('mapsapp').tableList().contains('maps').do(function(tableExists) {
      return r.branch(tableExists, {exists:1}, r.db('mapsapp').tableCreate('maps'));
    }).run(connection, function(err, results) {
      if (err) throw err;
      if ( results.exists == 1) {
        console.log("maps table exists");
      }
    });
    console.log("checking for markers table.");
    r.db('mapsapp').tableList().contains('markers').do(function(tableExists) {
      return r.branch(tableExists, {exists:1}, r.db('mapsapp').tableCreate('markers'));
    }).run(connection, function(err, results) {
      if (err) throw err;
      if (results.exists == 1) {
        console.log("markers table exists");
      }
    });
});
console.log("Done verifying DB.")

var newmap = function(conn, name, desc, callback) {
  return r.db("mapsapp").table("maps").insert({
    name: name,
    description: desc
  }).run(conn, callback);
}

var getMap = function(conn, name, callback) {
  answer = null;
  r.db("mapsapp").table("maps").get({"name":name}).run(conn, function(err, results) {
    if (err) throw err;
    answer = results;
  });
  return answer;
}

var addTo = function (conn, name, type, latlngs, style, data, callback) {
  if ( type == "polygon") addPolygon(conn, name, latlngs, style, callback);
  else if ( type == "polyline") addPolyline(conn, name, latlngs, style, callback);
}

var addMarker = function(conn, name, point, style, callback) {
  r.table("maps")
    .get(name)('markers')
    .append({"point":r.point(point[1], point[0]), "style":style, "data":{}})
    .run(conn, callback);
}

var addPolyline = function(conn, name, latlngs, style, callback) {
  r.table("maps")
    .get(name)('polylines')
    .append({"latlngs":r.line(latlngs), "style":style, "data":{}})
    .run(conn, callback);
}

var addPolygon = function(conn, name, latlngs, style, callback) {
  r.table("maps")
    .get(name)('polygons')
    .append({"polygon":r.polygon(latlngs), "style":style, "data":{}})
    .run(conn, callback);
}

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
var io = sockio.listen(app.listen(4200), {log:true});

app.get('/api/markers', function (req, res) {
  fs.readdir("public/images/markers", function(err, items) {
    res.send(JSON.stringify(items));
  });
});

// add to map
var mapname = "maps_my"
var add_callback = function(err, results) {
  if (err) return;
  console.log(result);
};

app.get('/api/data/addmap/:name/:desc', function(req, res) {
  var success = "";
  mapname = req.params.name;
  desc = req.params.desc;
  r.db("mapsapp").table("maps").insert({
    name: mapname,
    description: desc
  }).run(connection, function(err, results) {
    if (results.inserted == 1) {
      console.log(results);
      res.send("successful");
    }
  });
});

// identifier is the array value.
// app.get('/api/data/addmarker/:id/:lng/:lat/:style/:data', function(req, res) {
//    r.db("mapsapp")
//    .table("maps").get(req.params.id).update({
//        markers:r.row('markers').append({lat:req.params.lat, lng:req.params.lng, style:req.params.style, data:req.params.data})
//    }).run(connection, function(err, results) {
//      if (err) throw err;
//      console.log(results);
//      if ( results.replaced == 1) res.send("added");
//      else res.send("problem");
//     });
// });

app.post('/api/data/addmarker', function(req, res) {
  console.log('in add marker post');
   r.db("mapsapp")
   .table("maps").get(req.body.id).update({
     markers:r.row('markers').append({lat:req.body.lat, lng:req.body.lng, style:req.body.style, data:req.body.data})
   }).run(connection, function(err, results) {
     if (err) throw err;
     console.log(results);
     if ( results.replaced == 1) res.send("added");
     else res.send("problem");
    });
});

app.post('/api/data/addpolygon', function(req, res) {
  console.log('in add polygon');
  r.db("mapsapp")
  .table("maps").get(req.body.id).update({
    polygons:r.row('polygons').append({latlngs:req.body.latlngs, style:req.body.style, data:req.body.data})
  }).run(connection, function(err, results) {
    if (err) throw err;
    console.log(results);
    if ( results.replaced == 1) res.send("added");
    else res.send("problem");
   });
});

app.post('/api/data/addpolyline', function(req, res) {
    console.log('in add polyline');
    r.db("mapsapp")
    .table("maps").get(req.body.id).update({
      polylines:r.row('polylines').append({latlngs:req.body.latlngs, style:req.body.style, data:req.body.data})
    }).run(connection, function(err, results) {
      if (err) throw err;
      console.log(results);
      if ( results.replaced == 1) res.send("added");
      else res.send("problem");
     });
});

app.get('/api/data/mapid/:name', function(req, res) {
  console.log(req.params.name);
  r.db("mapsapp").table("maps").filter({name:'mymap'}).limit(1)
   .run(connection, function(err, curser) {
    if (err) {
      throw err;
    } else {
      curser.next(function(err, row) {
        if (err) throw err;
        else {
          console.log(row);
          res.send(JSON.stringify({id:row.id}));
        }
      });
    }
  });
});
