import {
  getCurrentTone,
  getStartAndEndDates,
  spWidth,
  spHeight,
  spPad,
  parseTime,
  formatTime,
  toneColors,
  maxScaleExtent,
  translateMaxRange,
  rotateXTicks
} from './constants';

import * as d3 from 'd3';
import merge from 'lodash/merge';

export class ScatterplotProcessor {
  constructor() {
    this.tweetsData = [];
    this.toneKey = getCurrentTone();
    this.yScaleSP = d3.scaleLinear()
                      .domain([0, 1])
                      .range([spHeight - spPad.bottom, spPad.top]);
    this.yAxisSP = d3.axisLeft(this.yScaleSP);
  }

  convertTimestamps(tweetsArr) {
    tweetsArr.forEach(tweet => {
      tweet.timestamp = parseTime(tweet.timestamp);
    });
  }

  createScatterplot(tweetsHash) {
    this.tweetsData = Object.values(merge({}, tweetsHash));
    this.convertTimestamps(this.tweetsData);

    this.createScales();
    this.createGridlineAxes();
    this.createZoomBehavior();
    this.createScatterplotSVG();
    this.drawGridlines();
    this.drawXYAxes();
  }

  createScales() {
    this.xScaleSP = d3.scaleTime()
                      .domain(getStartAndEndDates(this.tweetsData))
                      .range([spPad.left, spWidth - spPad.right]);

    this.xAxisSP = d3.axisBottom(this.xScaleSP)
                     .tickFormat(formatTime);
  }

  createGridlineAxes() {
    this.makeVertGridLines = d3.axisBottom(this.xScaleSP)
                               .tickSize(95 - spHeight)
                               .tickFormat("");

    this.makeHorizGridLines = d3.axisLeft(this.yScaleSP)
                               .tickSize(75 - spWidth)
                               .tickFormat("");
  }

  createZoomBehavior() {
    this.zoom = d3.zoom()
                  .scaleExtent([1, maxScaleExtent(this.tweetsData)])
                  .translateExtent(translateMaxRange(spWidth, spHeight))
                  // .on("zoom", zoomed);
  }

  createScatterplotSVG() {
    this.spSVG = d3.select(".scatterplot-container")
                   .append("svg")
                   .attr("class", "scatterplot-svg")
                   .attr("viewBox", `0 0 ${spWidth + " " + spHeight}`)
                   .call(this.zoom)
                   .on("wheel.zoom", null);
  }

  drawGridlines() {
    //draw vertical gridlines
    this.gridY = this.spSVG.append("g")
                           .attr("class", "grid y")
                           .attr("transform", "translate(0," + (spHeight - spPad.bottom) + ")")
                           .call(this.makeVertGridLines);

    //draw horizontal gridlines
    this.gridX = this.spSVG.append("g")
                           .attr("class", "grid x")
                           .attr("transform", "translate(" + spPad.left + ", 0)")
                           .call(this.makeHorizGridLines);
  }

  drawXYAxes() {
    //draw x axis
    this.gx = this.spSVG.append("g")
                         .attr("class", "x axis")
                         .attr("transform", "translate(0," + (spHeight - spPad.bottom) + ")")
                         .call(this.xAxisSP);
    rotateXTicks(this.gx);

    //draw y axis
    this.gy = this.spSVG.append("g")
                       .attr("class", "y axis")
                       .attr("transform", "translate(" + spPad.left + ", 0)")
                       .call(this.yAxisSP);
  }
}
