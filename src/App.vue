<template>
  <div id="app">
    <gmap-map
      :center="center"
      :zoom="zoom"
      map-type-id="terrain"
      style="width: 100vw; height: 90vh">
      
      <template
        v-for="(routes) in taxis">

        <gmap-polyline
          v-for="(path, i) of routes"
          v-if="options.hired == null || getHiredBoolean(path[0].hired) == options.hired"
          :key="`${path[0].id}_${i}`"
          :options="{ strokeWeight: 0.5, strokeColor: getColor(path[0].hired) }"
          :path="path" />

      </template>

    </gmap-map>

    Hired: <input type="checkbox" v-model="options.hired" />
  </div>
</template>

<script>
import * as taxi from './assets/taxi.csv';

export default {
  name: 'app',
  data() {
    return {
      center: {lat:59.33258, lng:18.0649},
      zoom: 12,
      taxis: {},
      options: {
        hired: null
      }
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let taxis = {}

      for (let i = 0; i < taxi.length; i++) {
        let id = taxi[i].id;
        if (!taxis[id])
          taxis[id] = [];

        taxis[id].push(taxi[i]);
      }

      for (let taxiID in taxis)
        taxis[taxiID] = this.catRoutes(taxis[taxiID]);

      console.log(taxis);

      this.taxis = taxis;
    },
    catRoutes(taxiCoordinates) {
      // Add timestamp property
      taxiCoordinates = taxiCoordinates.map((d) => {
        return {
          id: d.id,
          time: Math.floor(new Date(d.date).getTime() / 1000),
          date: d.date,
          lng: d.x_coord,
          lat: d.y_coord,
          hired: d.hired
        }
      })

      // Sort by timestamp
      taxiCoordinates.sort((a, b) => {
        return a.time - b.time
      })

      // Add first record to first route
      let routes = [
        [
          taxiCoordinates[0]
        ]
      ];

      let routeID = 0;
      for (let i = 1; i < taxiCoordinates.length; i++) {
        let index = routes[routeID].length - 1;

        // Increment routeID if time difference is too big
        if (
          taxiCoordinates[i].time > routes[routeID][index].time + 180 ||
          taxiCoordinates[i].hired !== routes[routeID][index].hired
        ) {
          routeID++;
          routes.push([]);
        }
        
        // Add record to correspondingg route array
        routes[routeID].push(taxiCoordinates[i]);
      }

      return routes;
    },
    getColor(hired) {
      if (hired == 'f')
        return '#FF0000'
      else
        return '#00CC00'
    },
    getHiredBoolean(hired) {
      if (hired == 't')
        return true;
      else if (hired == 'f')
        return false;

      return null;
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>