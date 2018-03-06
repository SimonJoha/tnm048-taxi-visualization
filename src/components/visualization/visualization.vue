<template>
  <div>
    <gmap-map
      :center="center"
      :zoom="zoom"
      map-type-id="terrain"
      @click="mapClicked"
      ref="map">
      
      <template v-for="(routes) in filteredTaxis">
        <template v-for="(path, i) of routes">
          <!-- START: Routes -->
          <gmap-polyline
            v-if="options.hiredMode == 0 || path[0].hired == options.hiredMode"
            :key="`polyline_${path[0].id}_${i}`"
            :options="{ strokeWeight: 0.5, strokeColor: getColor(path[0].hired) }"
            :path="path" />
          <!-- END: Routes -->

          <!-- START: Start and end points on map -->
          <template v-if="options.showStartEndPoints">
            <gmap-circle
              :key="`circle_${i}_${path[0].id}_start`" 
              :center="path[0]" 
              :radius="5"
              :options="{ strokeWeight: 0, fillOpacity: 1, fillColor: getColor('t') }" />

            <gmap-circle 
              :key="`circle_${i}_${path[0].id}_end`" 
              :center="path[path.length - 1]" 
              :radius="5"
              :options="{ strokeWeight: 0, fillOpacity: 1, fillColor: getColor('f') }" />
          </template>
          <!-- END: Start and end points on map -->

        </template>
      </template>
      
      <!-- START: Route filters -->
      <GmapMarker 
        v-if="routeFilters" 
        v-for="(routeFilter, i) of routeFilters" 
        :key="`filter_marker_${i}`" 
        :position="routeFilter"
        @click="filterMarkerClicked(i)" />
      
      <GmapCircle 
        v-if="routeFilters" 
        v-for="(routeFilter, i) of routeFilters" 
        :key="`filter_circle_${i}`"
        :center="routeFilter" 
        :radius="options.routeFilterRadius" 
        :options="{ fillOpacity: 0.1 }" />
      <!-- END: Route filters -->

    </gmap-map>

    <div class="controls">
      <md-card>
        <md-card-header>
          <div class="md-title">Taxi Visualization</div>
          <div class="md-subtitle">A visualization of taxis in Stockholm 2013</div>
          <div class="md-subhead">{{ rawData.length }} coordinates from 50 taxi cars</div>
        </md-card-header>
        <md-card-content>

          <md-table class="description">
            <md-table-row>
              <md-table-head md-numeric>Symbol</md-table-head>
              <md-table-head md-numeric>Description</md-table-head>
            </md-table-row>
            <md-table-row>
              <md-table-cell><div class="dot green"></div></md-table-cell>
              <md-table-cell>Departure point</md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell><div class="dot red"></div></md-table-cell>
              <md-table-cell>Arrival point</md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell><div class="line green"></div></md-table-cell>
              <md-table-cell>Hired route</md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell><div class="line red"></div></md-table-cell>
              <md-table-cell>Non-hired route</md-table-cell>
            </md-table-row>
          </md-table>

        </md-card-content>

        <div class="authors">By Jacob Andersson, Simon Johansson &amp; Jonathan Fransson</div>
      </md-card>

      <md-card>
        <md-card-header>
          <div class="md-title">Map Settings</div>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label for="movie">Show cars</label>
            <md-select v-model="options.hiredMode">
              <md-option value="0">All cars</md-option>
              <md-option value="t">Hired cars</md-option>
              <md-option value="f">Not hired cars</md-option>
            </md-select>
          </md-field>

          <md-checkbox v-model="options.showStartEndPoints">Show route start and end points</md-checkbox>
        </md-card-content>
      </md-card>
      
      <md-card>
        <md-card-header>
          <div class="md-title">Statistics</div>
        </md-card-header>
        <md-card-content>
          <md-table>
            <md-table-row>
              <md-table-head md-numeric>Hired</md-table-head>
              <md-table-head md-numeric>Not hired</md-table-head>
              <md-table-head md-numeric>Ratio</md-table-head>
            </md-table-row>
            <md-table-row>
              <md-table-cell>{{ hiredRatio.hired }}</md-table-cell>
              <md-table-cell>{{ hiredRatio.not }}</md-table-cell>
              
              <md-table-cell v-if="hiredRatio.ratio">{{ hiredRatio.ratio }}</md-table-cell>
              <md-table-cell v-else>-</md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>

<script src="./visualization.js"></script>
<style lang="scss" src="./visualization.scss"></style>