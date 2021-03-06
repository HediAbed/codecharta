import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Node, CodeMapNode, State } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_STATE, METRIC_DATA, STATE, TEST_FILE_WITH_PATHS, TEST_NODES, VALID_EDGES } from "../../util/dataMocks"
import { NodeDecorator } from "../../util/nodeDecorator"
import { Object3D, Vector3 } from "three"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setState } from "../../state/store/state.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setNodeMetricData } from "../../state/store/metricData/nodeMetricData/nodeMetricData.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { klona } from "klona"

describe("codeMapRenderService", () => {
	let storeService: StoreService
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let state: State
	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
		withMockedCodeMapLabelService()
		withMockedCodeMapArrowService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		state = klona(STATE)
		map = klona(TEST_FILE_WITH_PATHS.map)
		NodeDecorator.decorateMap(map, { nodeMetricData: METRIC_DATA, edgeMetricData: [] }, [])
		NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, DEFAULT_STATE.fileSettings.attributeTypes)
		storeService.dispatch(setState(state))
		storeService.dispatch(unfocusNode())
		storeService.dispatch(setNodeMetricData(METRIC_DATA))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(storeService, threeSceneService, codeMapLabelService, codeMapArrowService)
		codeMapRenderService["showCouplingArrows"] = jest.fn()
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapRenderService["threeSceneService"] = jest.fn().mockReturnValue({
			scaleHeight: jest.fn(),
			mapGeometry: jest.fn().mockReturnValue({
				scale: new Vector3(1, 2, 3)
			}),
			setMapMesh: jest.fn()
		})()
	}

	function withMockedCodeMapLabelService() {
		codeMapLabelService = codeMapRenderService["codeMapLabelService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearLabels: jest.fn(),
			addLabel: jest.fn()
		})()
	}

	function withMockedCodeMapArrowService() {
		codeMapArrowService = codeMapRenderService["codeMapArrowService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearArrows: jest.fn(),
			addEdgeArrows: jest.fn(),
			arrows: [new Object3D()]
		})()
	}

	describe("scaleMap", () => {
		let scaling: Vector3

		beforeEach(() => {
			scaling = new Vector3(1, 2, 3)
		})

		it("should call codeMapLabelService.scale", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(codeMapLabelService.scale).toHaveBeenCalledWith()
		})

		it("should call codeMapArrowService.scale", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(codeMapArrowService.scale).toHaveBeenCalledWith()
		})

		it("should call threeSceneService.scaleHeight", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(threeSceneService.scaleHeight).toHaveBeenCalled()
		})
	})

	describe("setNewMapMesh", () => {
		it("should call threeSceneService.setMapMesh", () => {
			codeMapRenderService["setNewMapMesh"](TEST_NODES)

			expect(threeSceneService.setMapMesh).toHaveBeenCalled()
		})
	})

	describe("getSortedNodes", () => {
		it("should get sorted Nodes as array", () => {
			const sortedNodes: Node[] = codeMapRenderService["getSortedNodes"](map)

			expect(sortedNodes).toMatchSnapshot()
		})
	})

	describe("setLabels", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
		})

		it("should call codeMapLabelService.clearLabels", () => {
			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
		})

		it("should call codeMapLabelService.addLabels for each shown leaf label", () => {
			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(2)
		})

		it("should not generate labels when showMetricLabelNodeName and showMetricLabelNameValue are both false", () => {
			storeService.dispatch(setShowMetricLabelNodeName(false))
			storeService.dispatch(setShowMetricLabelNameValue(false))

			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(0)
		})
	})

	describe("setArrows", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
			codeMapArrowService.clearArrows = jest.fn()
			codeMapArrowService["addEdgePreview"] = jest.fn()
		})

		it("should call codeMapArrowService.clearArrows", () => {
			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
		})

		it("should call codeMapArrowService.addEdgeArrows", () => {
			storeService.dispatch(setEdges(VALID_EDGES))

			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService["addEdgePreview"]).toHaveBeenCalledWith(sortedNodes)
		})
	})
})
