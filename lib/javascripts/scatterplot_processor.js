import {
  toneCategories,
  getCurrentTone,
  getStartAndEndDates,
  spWidth,
  spHeight,
  spPad,
  parseTime,
  formatTime,
  convertTimestamps,
  toneColors,
  maxScaleExtent,
  translateMaxRange,
  rotateXTicks,
  highlightCirclesCol,
  formatCircleData,
  dotFadeEffect,
  applyTooltipEffect
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

    this.xScaleMoreData = null;

    this.toneToggleStatus = {
        "anger": true,
        "disgust": true,
        "fear": true,
        "joy": true,
        "sadness": true,
        "analytical": true,
        "confident": true,
        "tentative": true,
        "openness": true,
        "conscientiousness": true,
        "extraversion": true,
        "agreeableness": true,
        "emotional range": true
    };

    this.newDataIsComingIn = false;
  }

  createScatterplot(tweetsHash) {
    this.tweetsData = Object.values(merge({}, tweetsHash));

    convertTimestamps(this.tweetsData);
    this.copyTweetData = merge([], this.tweetsData);

    this.createScales();
    this.createGridlineAxes();
    this.createZoomBehavior();
    this.createScatterplotSVG();
    this.drawGridlines();
    this.drawXYAxes();
    this.drawLikelihoodLines();
    this.createClippingPath();
    this.setupLegend();
    this.createCircleGroups();
    this.createCircles();
    this.changeTopGridlineToBlack();

    d3.select(".selectToneDropdown")
      .on("change", this.updateScatterplot);
  }

  createScales() {
    this.xScaleSP = d3.scaleTime()
                      .domain(getStartAndEndDates(this.tweetsData))
                      .range([spPad.left, spWidth - spPad.right]);

    this.updatedXScaleSP = this.xScaleSP;

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
                  .on("zoom", this.zoomed.bind(this));
  }

  zoomed() {
     this.updatedXScaleSP = d3.event.transform
                              .rescaleX(this.xScaleMoreData || this.xScaleSP);

     this.gx.call(this.xAxisSP.scale(this.updatedXScaleSP));
     rotateXTicks(this.gx);

     this.spSVG.selectAll(".dataPoint")
               .attr("cx", d => this.updatedXScaleSP(d.timestamp));

     this.gridY.call(this.makeVertGridLines.scale(this.updatedXScaleSP));
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

  drawLikelihoodLines() {
    let appendLikelihoodLine = (className, yPos) => {
         this.spSVG.append("line")
             .attr("class", className)
             .attr("x1", spPad.left)
             .attr("x2", spWidth - spPad.right)
             .attr("y1", this.yScaleSP(yPos) + 0.5)
             .attr("y2", this.yScaleSP(yPos) + 0.5)
             .attr("stroke", "red")
             .attr("stroke-dasharray", "2, 3");
    };

    appendLikelihoodLine("notlikelypresentLine", 0.5);
    appendLikelihoodLine("likelypresentLine", 0.75);
  }

  //this is to prevent data points from appearing outside the plot area
  createClippingPath() {
    this.spSVG.append("clipPath")
             	.attr("id", "sp-area")
             	.append("rect")
             	.attr("x", spPad.left + 1)
             	.attr("y", spPad.top + 1)
             	.attr("width", spWidth - spPad.left - spPad.right - 1)
             	.attr("height", spHeight - spPad.top - spPad.bottom - 1);

    this.gCirclesOuterContainer = this.spSVG.append("g")
           			                    .attr("clip-path", "url(#sp-area)");
  }

  setupLegend() {
    let legendContainers = d3.select(".legend")
                             .selectAll("div")
                             .data(toneCategories[this.toneKey], d => d.key)
                             .enter()
                             .append("div")
                             .attr("class", "legendCategoryContainer")
                             .call(this.toggleLegend);

     legendContainers.append("div")
                     .attr("class", "legendCategoryColor")
                     .style("background-color", d => toneColors[d.tone]);

     legendContainers.append("div")
                     .attr("class", "legendCategoryLabel")
                     .text(d => d.tone);
  }

  toggleLegend(legendContainer) {
    let that = this;

    legendContainer.on("click", function(d, i) {
      $(this).toggleClass("off");

      if (this.getAttribute("class").includes("off")) {
        that.tweetsData.forEach(tweet => {
          delete tweet[this.toneKey][d.tone];
        });
      } else {
        that.tweetsData.forEach((tweet, i) => {
          tweet[this.toneKey][d.tone] = that.copyTweetData[i][this.toneKey][d.tone];
        });
      }

      this.toneToggleStatus[d.tone] = !this.toneToggleStatus[d.tone];
      this.updateScatterplot(this.tweetsData);
    });
  }

  createCircleGroups() {
    this.dataColumns = this.gCirclesOuterContainer.selectAll("g")
                           .data(this.tweetsData, d => d.id)
                           .enter()
                           .append("g")
                           .attr("class", "tweetCircleGroup")
                           .call(highlightCirclesCol);
  }

  createCircles() {
    this.dataColumns.selectAll("circle")
                    .data(formatCircleData, d => d.dotId)
                    .enter()
                    .append("circle")
                    .attr("class", "dataPoint")
                    .attr("cx", d => this.xScaleSP(d.timestamp))
                    .attr("cy", (d, i) => this.yScaleSP(d[i]))
                    .attr("r", 4)
                    .attr("fill", (d, i) => toneColors[d.toneTitle])
                    .attr("opacity", dotFadeEffect)
                    .call(applyTooltipEffect);
  }

  changeTopGridlineToBlack() {
    $(".grid.x g:last-child line").attr("class", "initialTopLine");
    $(".initialTopLine").css("stroke", "black");
  }

  updateScatterplot(changedData) {
    this.toneKey = getCurrentTone();

    if (changedData) {
      this.newDataIsComingIn = changedData.length > this.copyTweetData.length;

      if (this.newDataIsComingIn) {
        this.copyTweetData = merge([], changedData);
        convertTimestamps(this.copyTweetData);
        this.rescaleXAxesAndZoom(this.copyTweetData);
      }

      let copyTweetData2 = merge([], changedData);
      convertTimestamps(copyTweetData2);

      this.tweetsData = copyTweetData2;
    }

      this.updateCircleGroups();
      this.updateCircles();
      this.updateLegend();
  }

  rescaleXAxesAndZoom(changedData) {
    this.updatedXScaleSP.domain(getStartAndEndDates(changedData));
    this.xScaleMoreData = this.updatedXScaleSP;

    this.gx.call(this.xAxisSP.scale(this.updatedXScaleSP));
    rotateXTicks(this.gx);

    this.spSVG.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);
    this.zoom.scaleExtent([1, maxScaleExtent(changedData)]);
  }

  updateCircleGroups() {
    this.dataColumns = this.gCirclesOuterContainer
                           .selectAll(".tweetCircleGroup")
                           .data(this.tweetsData, d => d.id)
                           .enter()
                           .append("g")
                           .attr("class", "tweetCircleGroup")
                           .merge(this.dataColumns)
                           .call(highlightCirclesCol);
  }

  updateCircles() {
    let circles = this.dataColumns.selectAll("circle")
                                  .data(formatCircleData, d => d.dotId);

    circles.exit()
           .transition()
           .duration(500)
           .attr("cy", spHeight)
           .remove();

     let newCircles = circles.enter()
                             .append("circle")
                             .attr("cx", d => this.updatedXScaleSP(d.timestamp))
                             .attr("opacity", dotFadeEffect)
                             .attr("class", "dataPoint")
                             .attr("r", 4)
                             .attr("fill", (d, i) => toneColors[d.toneTitle]);

     newCircles.merge(circles)
               .call(applyTooltipEffect)
               .transition()
               .duration(500)
               .attr("cy", (d, i) => this.yScaleSP(d[i]))
               .attr("cx", d => this.updatedXScaleSP(d.timestamp));
  }

  updateLegend() {
    let legendBoxes = d3.select(".legend")
                        .selectAll(".legendCategoryContainer")
                        .data(toneCategories[this.toneKey], d => d.key);

    legendBoxes.exit().remove();

    let eachLegendBox = legendBoxes.enter()
                                   .append("div")
                                   .attr("class", (d, i) => {
                                       if (this.newDataIsComingIn) {
                                         for (key in this.toneToggleStatus) {
                                           this.toneToggleStatus[key] = true;
                                         }

                                         this.newDataIsComingIn = false;
                                         return "legendCategoryContainer";
                                       }

                                       if (!this.toneToggleStatus[d.tone]) {
                                         return "legendCategoryContainer off";
                                       } else {
                                         return "legendCategoryContainer";
                                       }
                                     })
                                   .call(this.toggleLegend);

     eachLegendBox.append("div")
                  .attr("class", "legendCategoryColor")
                  .style("background-color", d => toneColors[d.tone]);

     eachLegendBox.append("div")
                  .attr("class", "legendCategoryLabel")
                  .text(d => d.tone);
  }

}
