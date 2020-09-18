"use strict"

import { CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { NodeDecorator } from "../../util/nodeDecorator"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { CodeMapRenderService } from "./codeMap.render.service"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import _ from "lodash"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions, setIsLoadingMap } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions, setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { SearchPanelModeActions } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { isActionOfType } from "../../util/reduxHelper"
import { SortingOrderAscendingActions } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { SortingOptionActions } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { IsAttributeSideBarVisibleActions } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { fileStatesAvailable, getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../model/files/files"
import { clone } from "../../util/clone"
import { PanelSelectionActions } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { PresentationModeActions } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { hierarchy } from "d3-hierarchy"

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService implements StoreSubscriber, MetricDataSubscriber, ScalingSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	private readonly debounceRendering: () => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private codeMapRenderService: CodeMapRenderService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		MetricDataService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		this.debounceRendering = _.debounce(() => {
			this.renderAndNotify()
		}, this.DEBOUNCE_TIME)
	}

	getRenderMap() {
		return this.unifiedMap
	}

	getRenderFileMeta() {
		return this.unifiedFileMeta
	}

	onStoreChanged(actionType: string) {
		if (
			this.allNecessaryRenderDataAvailable() &&
			!isActionOfType(actionType, ScalingActions) &&
			!isActionOfType(actionType, IsLoadingMapActions) &&
			!isActionOfType(actionType, IsLoadingFileActions) &&
			!isActionOfType(actionType, SearchPanelModeActions) &&
			!isActionOfType(actionType, SortingOrderAscendingActions) &&
			!isActionOfType(actionType, SortingOptionActions) &&
			!isActionOfType(actionType, IsAttributeSideBarVisibleActions) &&
			!isActionOfType(actionType, PanelSelectionActions) &&
			!isActionOfType(actionType, PresentationModeActions)
		) {
			this.debounceRendering()
		}
	}

	onScalingChanged() {
		if (this.allNecessaryRenderDataAvailable()) {
			this.scaleMapAndNotify()
		}
	}

	onMetricDataChanged() {
		if (fileStatesAvailable(this.storeService.getState().files)) {
			this.updateRenderMapAndFileMeta()
			this.decorateIfPossible()
			if (this.allNecessaryRenderDataAvailable()) {
				this.debounceRendering()
			}
		}
	}

	private updateRenderMapAndFileMeta() {
		const unifiedFile = this.getSelectedFilesAsUnifiedMap()
		this.unifiedMap = unifiedFile.map
		this.unifiedFileMeta = unifiedFile.fileMeta
	}

	private decorateIfPossible() {
		const state = this.storeService.getState()
		const { metricData } = state
		if (this.unifiedMap && fileStatesAvailable(state.files) && this.unifiedFileMeta && metricData.nodeMetricData) {
			NodeDecorator.decorateMap(this.unifiedMap, metricData, state.fileSettings.blacklist)
			this.getEdgeMetricsForLeaves(this.unifiedMap)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(
				this.unifiedMap,
				isDeltaState(state.files),
				state.fileSettings.attributeTypes
			)
		}
	}

	private getEdgeMetricsForLeaves(map: CodeMapNode) {
		if (this.edgeMetricDataService.getMetricNames()) {
			const nodes = hierarchy(map).leaves()
			for (const node of nodes) {
				const edgeMetrics = this.edgeMetricDataService.getMetricValuesForNode(node)
				for (const edgeMetric of edgeMetrics.keys()) {
					node.data.edgeAttributes[edgeMetric] = edgeMetrics.get(edgeMetric)
				}
			}
		}
	}

	private getSelectedFilesAsUnifiedMap() {
		const { files } = this.storeService.getState()
		const visibleFileStates = clone(getVisibleFileStates(files))

		if (isSingleState(files)) {
			return visibleFileStates[0].file
		}
		if (isPartialState(files)) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		}
		if (isDeltaState(files)) {
			return this.getDeltaFile(visibleFileStates)
		}
	}

	private getDeltaFile(visibleFileStates: FileState[]) {
		if (visibleFileStates.length === 2) {
			let [reference, comparison] = visibleFileStates
			if (reference.selectedAs !== FileSelectionState.Reference) {
				const temporary = reference
				comparison = reference
				reference = temporary
			}
			return DeltaGenerator.getDeltaFile(reference.file, comparison.file)
		}
		// Compare with itself. This is somewhat questionable.
		const [{ file }] = visibleFileStates
		return DeltaGenerator.getDeltaFile(file, file)
	}

	private renderAndNotify() {
		this.codeMapRenderService.render(this.unifiedMap)
		this.removeLoadingGifs()
		this.notifyMapChanged()
	}

	private scaleMapAndNotify() {
		this.showLoadingMapGif()
		this.codeMapRenderService.scaleMap()
		this.removeLoadingGifs()
	}

	private allNecessaryRenderDataAvailable() {
		return (
			fileStatesAvailable(this.storeService.getState().files) &&
			this.storeService.getState().metricData.nodeMetricData !== null &&
			this.areChosenMetricsInMetricData() &&
			_.values(this.storeService.getState().dynamicSettings).every(x => {
				return x !== null && _.values(x).every(x => x !== null)
			})
		)
	}

	private areChosenMetricsInMetricData() {
		const { dynamicSettings } = this.storeService.getState()
		return (
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.areaMetric) &&
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.colorMetric) &&
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.heightMetric)
		)
	}

	private removeLoadingGifs() {
		if (this.storeService.getState().appSettings.isLoadingFile) {
			this.storeService.dispatch(setIsLoadingFile(false))
		}
		this.storeService.dispatch(setIsLoadingMap(false))
	}

	private showLoadingMapGif() {
		this.storeService.dispatch(setIsLoadingMap(true))
	}

	private notifyMapChanged() {
		this.$rootScope.$broadcast(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, this.unifiedMap)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, (_event, data) => {
			subscriber.onRenderMapChanged(data)
		})
	}
}
