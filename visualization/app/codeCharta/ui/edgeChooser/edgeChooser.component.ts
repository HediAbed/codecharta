import "./edgeChooser.component.scss"
import { MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { EdgeMetricService, EdgeMetricServiceSubscriber } from "../../state/edgeMetric.service"

export class EdgeChooserController implements EdgeMetricServiceSubscriber {
	private noMetricsAvailable: string = "No Edge Metrics available"

	private _viewModel: {
		edgeMetricData: MetricData[]
		edgeMetric: string
	} = {
		edgeMetricData: [],
		edgeMetric: "No Edge Metrics available"
	}

	constructor($rootScope: IRootScopeService, private edgeMetricService: EdgeMetricService) {
		EdgeMetricService.subscribe($rootScope, this)
	}

	public onEdgeMetricDataUpdated(edgeMetrics: MetricData[]) {
		this._viewModel.edgeMetricData = edgeMetrics

		let edgeMetricNames = this.edgeMetricService.getMetricNames()

		if (!edgeMetricNames.includes(this._viewModel.edgeMetric)) {
			if (edgeMetricNames.length > 0) {
				this._viewModel.edgeMetric = edgeMetricNames[0]
			} else {
				this._viewModel.edgeMetric = this.noMetricsAvailable
			}
		}
	}
}

export const edgeChooserComponent = {
	selector: "edgeChooserComponent",
	template: require("./edgeChooser.component.html"),
	controller: EdgeChooserController
}
