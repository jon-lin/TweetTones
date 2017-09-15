import * from './constants';
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
  }

  convertTimestamps(tweetsArr) {
    tweetsArr.forEach(tweet => {
      tweet.timestamp = parseTime(tweet.timestamp);
    });
  }

  createScatterplot(tweetsHash) {
    this.tweetsData = Object.values(merge({}, tweetsHash));

    this.convertTimestamps(this.tweetsData);
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
    // let that = this;

    legendContainer.on("click", function(d, i) {
      $(this).toggleClass("off");

      // if (this.getAttribute("class").includes("off")) {
      //   that.tweetsData.forEach(tweet => {
      //     delete tweet[this.toneKey][d.tone];
      //   });
      // } else {
      //   that.tweetsData.forEach((tweet, i) => {
      //     tweet[this.toneKey][d.tone] = that.copyTweetData[i][this.toneKey][d.tone];
      //   });
      // }
      //
      // this.toneToggleStatus[d.tone] = !this.toneToggleStatus[d.tone];
      // updateChart(lineChartData);
    });
  }

  createCircleGroups() {
    let dataColumns = this.gCirclesOuterContainer.selectAll("g")
                          .data(lineChartData, d => d.id)
                          .enter()
                          .append("g")
                          .attr("class", "tweetCircleGroup")
                          .call(highlightCirclesCol);
  }

}
