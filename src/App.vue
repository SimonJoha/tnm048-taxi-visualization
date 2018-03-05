<template>
  <div id="app">
    <gmap-map
      :center="center"
      :zoom="zoom"
      map-type-id="terrain"
      style="width: 100vw; height: 90vh"
      @click="clicked">
      
      <template
        v-for="(routes) in filteredTaxis">
          <gmap-polyline
            v-for="(path, i) of routes"
            v-if="options.hired == null || getHiredBoolean(path[0].hired) == options.hired"
            :key="`${path[0].id}_${i}`"
            :options="{ strokeWeight: 0.5, strokeColor: getColor(path[0].hired) }"
            :path="path" />
      </template>

      <GmapMarker v-if="routeFilter" :position="routeFilter" />
      <GmapCircle v-if="routeFilter" :center="routeFilter" :radius="options.routeFilterRadius" />

    </gmap-map>

    Hired: <input type="checkbox" v-model="options.hired" />
    (hired: {{ hiredRatio.hired }}, not: {{ hiredRatio.not }}, ratio {{ hiredRatio.hired / hiredRatio.not }})
  </div>
</template>

<script>
import * as taxi from './assets/taxi_20k.csv';

export default {
  name: 'app',
  data() {
    return {
      center: {lat:59.33258, lng:18.0649},
      zoom: 12,
      taxis: {},
      routeFilter: null,
      hiredRatio: {
        hired: 0,
        not: 0
      },
      options: {
        hired: null,
        routeFilterRadius: 1000
      }
    };
  },
  mounted() {
    this.getData();
  },
  computed: {
    filteredTaxis() {
      // Copy object to new variable
      let filteredTaxis = Object.assign({}, this.taxis);

      if (this.routeFilter) {
        this.hiredRatio = {
          hired: 0,
          not: 0
        };

        let radius = this.options.routeFilterRadius * 0.00001;
        let rf = this.routeFilter;
        for (let taxiID in filteredTaxis) {
          let taxi = filteredTaxis[taxiID];

          filteredTaxis[taxiID] = taxi.filter((r) => {
            let visible = false;
            let singleTaxiHiredRatio = {
              hired: 0,
              not: 0
            };

            for (let i = 0; i < r.length; i++) {
              if (Math.sqrt(
                    Math.pow(r[i].lat - rf.lat, 2) + Math.pow(r[i].lng - rf.lng, 2)
                  ) <= radius
              )
                visible = true;

              if (this.getHiredBoolean(r[i].hired))
                singleTaxiHiredRatio.hired++;
              else
                singleTaxiHiredRatio.not++;
            }

            if (visible) {
              this.hiredRatio.hired += singleTaxiHiredRatio.hired;
              this.hiredRatio.not += singleTaxiHiredRatio.not;
            }            
              
            return visible;
          })
        }
      }

      return filteredTaxis;
    }
  },
  methods: {
    getData() {
      let taxis = {}

      for (let i = 0; i < taxi.length; i++) {
        let id = taxi[i].id;
        if (!taxis[id])
          taxis[id] = [];

        taxis[id].push(taxi[i]);

        if (this.getHiredBoolean(taxi[i].hired))
          this.hiredRatio.hired++;
        else
          this.hiredRatio.not++;
      }

      for (let taxiID in taxis)
        taxis[taxiID] = this.catRoutes(taxis[taxiID]);

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
    },
    clicked(position) {
      console.log('Clicked');

      if (this.routeFilter) {
        this.routeFilter = null;
        return;
      }

      let latLng = position.latLng;
      this.routeFilter = {
        lat: latLng.lat(),
        lng: latLng.lng()
      }
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