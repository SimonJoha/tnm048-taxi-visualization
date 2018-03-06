/*
import * as taxi_mine_1 from '@/assets/taxi_1M/taxi_1M_1.csv';
import * as taxi_mine_2 from '@/assets/taxi_1M/taxi_1M_2.csv';
*/
import * as taxi from '@/assets/mined/taxi_500k_mined.csv';

export default {
  name: 'app',
  data() {
    return {
      center: {lat:59.33258, lng:18.0649},
      zoom: 12,
      taxis: {},
      rawData: [],
      routeFilters: [],
      options: {
        hiredMode: '0',
        routeFilterRadius: 1000,
        showStartEndPoints: false
      },
      mining: {
        array: [],
        taxiIDs: []
      },
      ctrl: false
    };
  },
  mounted() {
    /*
    this.mineData(taxi_mine_1);
    this.mineData(taxi_mine_2);

    console.log(this.mining.array, this.mining.taxiIDs);
    */

    this.loadData();
    this.rawData = taxi;

    window.addEventListener("keydown", e => {
      // Bind CTRL key
      if (e.keyCode === 17)
        this.ctrl = true;
    });

    window.addEventListener("keyup", e => {
      // Bind CTRL key
      if (e.keyCode === 17)
        this.ctrl = false;
    });
  },
  computed: {
    filteredTaxis() {
      // Copy object to new variable
      let filteredTaxis = Object.assign({}, this.taxis);

      if (this.routeFilters.length > 0) {

        let radius = this.options.routeFilterRadius * 0.00001;
        
        for (let taxiID in filteredTaxis) {
          let taxi = filteredTaxis[taxiID];

          filteredTaxis[taxiID] = taxi.filter((r) => {
            let insideAllFilters = true;

            // Loop through all filter markers
            this.routeFilters.forEach(rf => {
              let insideFilter = false;

              // Loop through all routes
              for (let i = 0; i < r.length; i++) {

                // Check if any point is inside filter radius
                if (Math.sqrt(
                      Math.pow(r[i].lat - rf.lat, 2) + Math.pow(r[i].lng - rf.lng, 2)
                    ) <= radius
                )
                  insideFilter = true;

              }

              // If not inside current iterated filter
              // Hide on map
              if (!insideFilter)
                insideAllFilters = false;
            });

            return insideAllFilters;

          });
        }
      }

      return filteredTaxis;
    },
    hiredRatio() {
      let taxis = this.filteredTaxis;
      let hiredRatio = {
        hired: 0,
        not: 0,
        ratio: null
      };

      for (let taxiID in taxis) {
        taxis[taxiID].forEach((r) => {
          if (this.getHiredBoolean(r[0].hired))
            hiredRatio.hired += r.length;
          else
            hiredRatio.not += r.length;
        });
      }

      if (hiredRatio.not > 0)
        hiredRatio.ratio = (Math.round(hiredRatio.hired / hiredRatio.not * 100) / 100);

      return hiredRatio;
    }
  },
  methods: {
    mineData(rawArray) {
      for (let i = 0; i < rawArray.length; i++)
        if (this.mining.taxiIDs.length < 50 || this.mining.taxiIDs.indexOf(rawArray[i].id) >= 0) {
          this.mining.array.push(rawArray[i]);

          if (this.mining.taxiIDs.indexOf(rawArray[i].id) < 0)
            this.mining.taxiIDs.push(rawArray[i].id);
        }
    },
    loadData() {
      let taxis = {}

      for (let i = 0; i < taxi.length; i++) {
        let id = taxi[i].id;
        if (!taxis[id])
          taxis[id] = [];

        taxis[id].push(taxi[i]);
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
          // If subroute includes 2 or more coordinates
          // Create new subroute for future coordinates
          if (routes[routeID].length > 1) {
            routeID++;
            routes.push([]);

          // If subroute does not have multiple coordinates
          // Skip save
          } else {
            routes[routeID] = [];
          }
        }
        
        // Add record to correspondingg route array
        routes[routeID].push(taxiCoordinates[i]);
      }

      return routes;
    },
    getColor(hired) {
      if (hired == 'f')
        return '#ff5252'
      else
        return '#4dce51'
    },
    getHiredBoolean(hired) {
      if (hired == 't')
        return true;
      else if (hired == 'f')
        return false;

      return null;
    },
    mapClicked(position) {
      // Reset filters if CTRL key was not pressed
      if (!this.ctrl && this.routeFilters.length > 0) {
        this.routeFilters = [];
        return;
      }

      let latLng = position.latLng;
      this.routeFilters.push({
        lat: latLng.lat(),
        lng: latLng.lng()
      });
    },
    filterMarkerClicked(i) {
      this.routeFilters.splice(i, 1);
    }
  }
}