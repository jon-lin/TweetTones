import { colorsByTitle, tonesTitleization, likelihoodLabel, bcOffsetCalc } from './constants';
import * as d3 from 'd3';

export class BarChartsProcessor {

  createBarChart (data, labels, title) {
    let xScaleBarCharts = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0, 250]);

    let xAxisBarCharts = d3.axisBottom(xScaleBarCharts);

    let svg = d3.select(".barcharts-container")
                .append("svg")
                .attr("viewBox", "0 0 500 300")
                .attr("class", title + "_barchart");

    let colors = colorsByTitle(title);

    let yScaleBarChart = d3.scaleBand()
                           .domain(labels)
                           .range([65, 275])
                           .paddingInner(0.2);

    let yAxisBarChart = d3.axisLeft(yScaleBarChart)
                          .tickSizeOuter(0)
                          .tickSizeInner(0);

    let offset = bcOffsetCalc(title);

    svg.append("text")
        .attr("x", 250)
        .attr("y", 42)
        .text(tonesTitleization[title])
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "25px");

    let bars = svg.selectAll("rect")
                  .data(data)
                  .enter();

    this.appendRectsAndLabels(bars, offset, yScaleBarChart, xScaleBarCharts, labels, colors);

    let yAxisBarChartDOM = svg.append("g")
                              .attr("class", "y axis")
                              .attr("transform", "translate(" + (120 + offset) + ",0)")
                              .call(yAxisBarChart);

    yAxisBarChartDOM.select("path").attr("stroke", "");
    yAxisBarChartDOM.selectAll("text").attr("font-size", "14.5px");
  }

  appendRectsAndLabels(bars, offset, yScaleBarChart, xScaleBarCharts, labels, colors) {
    let fadeEffectBC = function(d) {
     if (d <= 0.5) { return 0.4; }
     else if (d <= 0.75) { return 0.75; }
     else { return 1; }
    }

    bars.append("rect")
        .attr("x", 125  + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]))
        .attr("width", d => xScaleBarCharts(d))
        .attr("height", yScaleBarChart.bandwidth())
        .attr("fill", (d, i) => colors[i])
        .attr("opacity", fadeEffectBC)
        .attr("class", "toneValueBar");

    bars.append("rect")
        .attr("x", d => 125 + xScaleBarCharts(d) + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]))
        .attr("width", d => 250 - xScaleBarCharts(d))
        .attr("height", yScaleBarChart.bandwidth())
        .attr("fill", "lightgray")
        .attr("opacity", fadeEffectBC)
        .attr("class", "emptyValueBar");

    bars.append("text")
        .attr("x", 125 + 250 + 10 + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]) + yScaleBarChart.bandwidth()/2)
        .text(d => d3.format(".2f")(d))
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("opacity", fadeEffectBC)
        .attr("class", "toneValueBarNumLabel");

    bars.append("text")
        .attr("x", 125 + 250 + 10 + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]) + yScaleBarChart.bandwidth()/2 + 12)
        .text(likelihoodLabel)
        .attr("opacity", fadeEffectBC)
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("class", "toneLikelihoodLabel");
  }
}
