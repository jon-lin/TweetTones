import {
  colorsByTitle,
  tonesTitleization,
  likelihoodLabel,
  bcOffsetCalc,
  fadeEffectBC
} from './constants';

import * as d3 from 'd3';

export class ScatterplotProcessor {
  constructor() {
    this.xScaleBarCharts = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0, 250]);

    this.xAxisBarCharts = d3.axisBottom(this.xScaleBarCharts);
  }
}
