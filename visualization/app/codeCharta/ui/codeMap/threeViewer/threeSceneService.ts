import { AmbientLight, DirectionalLight, Scene, Group, Material } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CodeMapPreRenderServiceSubscriber, CodeMapPreRenderService } from "../codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { CodeMapNode } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { ColorConverter } from "../../../util/color/colorConverter"

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(selectedBuilding?: CodeMapBuilding)
}

export interface BuildingDeselectedEventSubscriber {
	onBuildingDeselected()
}

export interface CodeMapMeshChangedSubscriber {
	onCodeMapMeshChanged(mapMesh: CodeMapMesh)
}

export class ThreeSceneService implements CodeMapPreRenderServiceSubscriber {
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_DESELECTED_EVENT = "building-deselected"
	private static readonly CODE_MAP_MESH_CHANGED_EVENT = "code-map-mesh-changed"

	scene: Scene
	labels: Group
	edgeArrows: Group
	mapGeometry: Group
	private readonly lights: Group
	private mapMesh: CodeMapMesh

	private selected: CodeMapBuilding = null
	private highlighted: CodeMapBuilding[] = []
	private constantHighlight: Map<number, CodeMapBuilding> = new Map()

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)

		this.scene = new Scene()
		this.mapGeometry = new Group()
		this.lights = new Group()
		this.labels = new Group()
		this.edgeArrows = new Group()

		this.initLights()

		this.scene.add(this.mapGeometry)
		this.scene.add(this.edgeArrows)
		this.scene.add(this.labels)
		this.scene.add(this.lights)
	}

	onRenderMapChanged() {
		this.reselectBuilding()
	}

	getConstantHighlight() {
		return this.constantHighlight
	}

	highlightBuildings() {
		const state = this.storeService.getState()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state, this.constantHighlight)
		if (this.mapGeometry.children[0]) {
			this.updateCorrectMaterial(this.mapGeometry.children[0]["material"], this.highlighted, false)
			if (this.selected) this.updateCorrectMaterial(this.mapGeometry.children[0]["material"], [this.selected], true)
		}
	}

	highlightBuildingsAfterSelect() {
		// TODO dead code? Remove it please.
		const state = this.storeService.getState()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state, this.constantHighlight)
	}

	private updateCorrectMaterial(materials: Material[], nodes: CodeMapBuilding[], select: boolean) {
		// TODO This loops introduce performance issues
		//  refactor it please
		return
		const allNodes = this.mapMesh.getNodes()

		for (const node of allNodes) {
			for (const material of materials) {
				for (const hoveredNode of nodes) {
					if (hoveredNode !== null) {
						if (select) {
							if (material.userData.id === hoveredNode.node.id) {
								material["color"].setHex(ColorConverter.convertHexToNumber(hoveredNode.color))
							}
						} else if (material.userData.id === hoveredNode.node.id) {
							material["color"].setHex(ColorConverter.convertHexToNumber("#FFFFFF"))
						} else if (material.userData.id === node.id) {
							material["color"].setHex(ColorConverter.convertHexToNumber("#7A7777"))
						}
					}
				}
			}
		}
	}

	private resetMaterial(materials: Material[]) {
		// TODO activate the function when the performance issue in updateCorrectMaterial() has been fixed.
		return
		const allNodes = this.mapMesh.getNodes()
		for (const node of allNodes) {
			for (const material of materials) {
				if (material.userData.id === node.id) {
					material["color"].setHex(ColorConverter.convertHexToNumber("#FFFFFF"))
				}
			}
		}
	}

	private resetHighlightMaterial(materials: Material[]) {
		this.resetMaterial(materials)
		this.updateCorrectMaterial(this.mapGeometry.children[0]["material"], [this.selected], true)
	}

	highlightSingleBuilding(building: CodeMapBuilding) {
		this.highlighted = []
		this.addBuildingToHighlightingList(building)
		this.highlightBuildings()
	}

	addBuildingToHighlightingList(building: CodeMapBuilding) {
		this.highlighted.push(building)
	}

	clearHoverHighlight() {
		this.highlighted = []
		this.highlightBuildings()
	}

	clearHighlight() {
		if (this.getMapMesh()) {
			this.getMapMesh().clearHighlight(this.selected)
			if (this.mapGeometry.children[0]) {
				this.resetHighlightMaterial(this.mapGeometry.children[0]["material"])
			}
			this.highlighted = []
			this.constantHighlight.clear()
		}
	}

	selectBuilding(building: CodeMapBuilding) {
		const color = this.storeService.getState().appSettings.mapColors.selected
		this.getMapMesh().selectBuilding(building, color)
		this.selected = building
		this.highlightBuildings()
		this.$rootScope.$broadcast(ThreeSceneService.BUILDING_SELECTED_EVENT, this.selected)
	}

	addNodeAndChildrenToConstantHighlight(codeMapNode: CodeMapNode) {
		const { lookUp } = this.storeService.getState()
		const codeMapBuilding = lookUp.idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = lookUp.idToBuilding.get(data.id)
			if (building) {
				this.constantHighlight.set(building.id, building)
			}
		}
	}

	removeNodeAndChildrenFromConstantHighlight(codeMapNode: CodeMapNode) {
		const { lookUp } = this.storeService.getState()
		const codeMapBuilding = lookUp.idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = lookUp.idToBuilding.get(data.id)
			if (building) {
				this.constantHighlight.delete(building.id)
			}
		}
	}

	clearConstantHighlight() {
		if (this.constantHighlight.size > 0) {
			this.clearHighlight()
		}
	}

	clearSelection() {
		if (this.selected) {
			this.getMapMesh().clearSelection(this.selected)
			this.resetMaterial(this.mapGeometry.children[0]["material"])
			this.$rootScope.$broadcast(ThreeSceneService.BUILDING_DESELECTED_EVENT)
		}
		if (this.highlighted.length > 0) {
			this.highlightBuildings()
		}
		this.selected = null
	}

	initLights() {
		const ambilight = new AmbientLight(0x707070) // soft white light
		const light1 = new DirectionalLight(0xe0e0e0, 1)
		light1.position.set(50, 10, 8).normalize()

		const light2 = new DirectionalLight(0xe0e0e0, 1)
		light2.position.set(-50, 10, -8).normalize()

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)
	}

	setMapMesh(mesh: CodeMapMesh) {
		const { mapSize } = this.storeService.getState().treeMap
		this.mapMesh = mesh

		// Reset children
		this.mapGeometry.children.length = 0

		this.mapGeometry.position.x = -mapSize
		this.mapGeometry.position.y = 0
		this.mapGeometry.position.z = -mapSize

		this.mapGeometry.add(this.mapMesh.getThreeMesh())
		this.notifyMapMeshChanged()
	}

	getMapMesh() {
		return this.mapMesh
	}

	scale() {
		const { mapSize } = this.storeService.getState().treeMap
		const scale = this.storeService.getState().appSettings.scaling

		this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.mapGeometry.position.set(-mapSize * scale.x, 0, -mapSize * scale.z)
		this.mapMesh.setScale(scale)
	}

	getSelectedBuilding() {
		return this.selected
	}

	getHighlightedBuilding() {
		return this.highlighted[0]
	}

	getHighlightedNode() {
		if (this.getHighlightedBuilding()) {
			return this.getHighlightedBuilding().node
		}
		return null
	}

	private reselectBuilding() {
		if (this.selected) {
			const buildingToSelect: CodeMapBuilding = this.getMapMesh().getBuildingByPath(this.selected.node.path)
			if (buildingToSelect) {
				this.selectBuilding(buildingToSelect)
			}
		}
	}

	private notifyMapMeshChanged() {
		this.$rootScope.$broadcast(ThreeSceneService.CODE_MAP_MESH_CHANGED_EVENT, this.mapMesh)
	}

	static subscribeToBuildingDeselectedEvents($rootScope: IRootScopeService, subscriber: BuildingDeselectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_DESELECTED_EVENT, () => {
			subscriber.onBuildingDeselected()
		})
	}

	static subscribeToBuildingSelectedEvents($rootScope: IRootScopeService, subscriber: BuildingSelectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_SELECTED_EVENT, (_event, selectedBuilding: CodeMapBuilding) => {
			subscriber.onBuildingSelected(selectedBuilding)
		})
	}

	static subscribeToCodeMapMeshChangedEvent($rootScope: IRootScopeService, subscriber: CodeMapMeshChangedSubscriber) {
		$rootScope.$on(this.CODE_MAP_MESH_CHANGED_EVENT, (_event, mapMesh: CodeMapMesh) => {
			subscriber.onCodeMapMeshChanged(mapMesh)
		})
	}
}
