import {
	AttributeTypeValue,
	CCFile,
	CodeMapNode,
	Edge,
	FileSelectionState,
	FileState,
	MetricData,
	Node,
	Settings
} from "../codeCharta.model"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { MetricDistribution } from "./fileExtensionCalculator"
import { Box3, Vector3 } from "three"

export const VALID_NODE: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	children: [
		{
			name: "big leaf",
			type: "File",
			attributes: { RLOC: 100, Functions: 10, MCC: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: "Folder",
			attributes: {},
			children: [
				{
					name: "small leaf",
					type: "File",
					attributes: { RLOC: 30, Functions: 100, MCC: 100 }
				},
				{
					name: "other small leaf",
					type: "File",
					attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
				}
			]
		}
	]
}

export const VALID_NODE_WITH_PATH: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	path: "/root",
	children: [
		{
			name: "big leaf",
			type: "File",
			path: "/root/big leaf",
			attributes: { RLOC: 100, Functions: 10, MCC: 1 },
			link: "http://www.google.de"
		},
		{
			name: "Parent Leaf",
			type: "Folder",
			attributes: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf",
					type: "File",
					path: "/root/Parent Leaf/small leaf",
					attributes: { RLOC: 30, Functions: 100, MCC: 100 }
				},
				{
					name: "other small leaf",
					type: "File",
					path: "/root/Parent Leaf/other small leaf",
					attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
				},
				{
					name: "empty folder",
					type: "Folder",
					path: "/root/Parent Leaf/empty folder",
					attributes: {},
					children: []
				}
			]
		}
	]
}

export const VALID_EDGES: Edge[] = [
	{
		fromNodeName: "/root/big leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		}
	},
	{
		fromNodeName: "/root/sample1 only leaf",
		toNodeName: "/root/Parent Leaf/small leaf",
		attributes: {
			pairingRate: 89,
			avgCommits: 34
		}
	}
]

export const VALID_EDGE: Edge = {
	fromNodeName: "/root/big leaf",
	toNodeName: "/root/Parent Leaf/small leaf",
	attributes: {
		pairingRate: 89,
		avgCommits: 34
	}
}

export const TEST_FILE_CONTENT = {
	fileName: "noFileName",
	projectName: "Sample Map",
	apiVersion: "1.1",
	nodes: [VALID_NODE]
}

export const TEST_FILE_DATA: CCFile = {
	fileMeta: {
		fileName: "file",
		projectName: "Sample Map",
		apiVersion: "1.1"
	},
	map: VALID_NODE,
	settings: {
		fileSettings: {
			attributeTypes: { nodes: [], edges: [] },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_FILE_WITH_PATHS: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		path: "/root",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				path: "/root/big leaf",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				path: "/root/Parent Leaf",
				children: [
					{
						name: "small leaf",
						type: "File",
						path: "/root/Parent Leaf/small leaf",
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: "File",
						path: "/root/Parent Leaf/other small leaf",
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
					},
					{
						name: "empty folder",
						type: "Folder",
						path: "/root/Parent Leaf/empty folder",
						attributes: {},
						children: []
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: [], edges: [] },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const METRIC_DISTRIBUTION: MetricDistribution[] = [
	{
		fileExtension: "java",
		absoluteMetricValue: 20,
		relativeMetricValue: 100,
		color: null
	}
]

export const NONE_METRIC_DISTRIBUTION: MetricDistribution[] = [
	{
		fileExtension: "none",
		absoluteMetricValue: null,
		relativeMetricValue: 100,
		color: "#000000"
	}
]

export const VALID_NODE_WITH_PATH_AND_EXTENSION: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	path: "/root",
	children: [
		{
			name: "big leaf.jpg",
			type: "File",
			path: "/root/big leaf.jpg",
			attributes: { RLOC: 100, Functions: 10, MCC: 1 }
		},
		{
			name: "another big leaf.java",
			type: "File",
			path: "/root/another big leaf.java",
			attributes: { RLOC: 120, Functions: 20, MCC: 2 }
		},
		{
			name: "Parent Leaf",
			type: "Folder",
			attributes: {},
			path: "/root/Parent Leaf",
			children: [
				{
					name: "small leaf.jpg",
					type: "File",
					path: "/root/Parent Leaf/small leaf.json",
					attributes: { RLOC: 30, Functions: 100, MCC: 100 }
				},
				{
					name: "other small leaf.json",
					type: "File",
					path: "/root/Parent Leaf/other small leaf.json",
					attributes: { RLOC: 70, Functions: 1000, MCC: 10 }
				},
				{
					name: "another leaf.java",
					type: "File",
					path: "/root/Parent Leaf/another leaf.java",
					attributes: { RLOC: 42, Functions: 330, MCC: 45 },
					children: []
				},
				{
					name: "leaf without extension",
					type: "File",
					path: "/root/Parent Leaf/leaf without extension",
					attributes: { RLOC: 15, Functions: 23, MCC: 33 },
					children: []
				}
			]
		}
	]
}

export const VALID_NODE_WITHOUT_RLOC_METRIC: CodeMapNode = {
	name: "root",
	attributes: {},
	type: "Folder",
	path: "/root",
	children: [
		{
			name: "big leaf.jpg",
			type: "File",
			path: "/root/big leaf.jpg",
			attributes: { RLOC: 0, Functions: 10, MCC: 1 }
		},
		{
			name: "another big leaf.java",
			type: "File",
			path: "/root/another big leaf.java",
			attributes: { RLOC: 0, Functions: 20, MCC: 2 }
		}
	]
}

export const TEST_DELTA_MAP_A: CCFile = {
	fileMeta: {
		fileName: "fileA",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: "File",
						attributes: { rloc: 30, functions: 100, mcc: 100 }
					},
					{
						name: "other small leaf",
						type: "File",
						attributes: { rloc: 70, functions: 1000, mcc: 10 }
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: [], edges: [] },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_DELTA_MAP_B: CCFile = {
	fileMeta: {
		fileName: "fileB",
		projectName: "Sample Project",
		apiVersion: "1.1"
	},
	map: {
		name: "root",
		type: "Folder",
		attributes: {},
		children: [
			{
				name: "big leaf",
				type: "File",
				attributes: { rloc: 20, functions: 10, mcc: 1 },
				link: "http://www.google.de"
			},
			{
				name: "additional leaf",
				type: "File",
				attributes: { rloc: 10, functions: 11, mcc: 5 },
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				type: "Folder",
				attributes: {},
				children: [
					{
						name: "small leaf",
						type: "File",
						attributes: { rloc: 30, functions: 100, mcc: 100, more: 20 }
					},
					{
						name: "other small leaf",
						type: "File",
						attributes: { rloc: 70, functions: 1000 }
					},
					{
						name: "big leaf",
						type: "File",
						attributes: { rloc: 20, functions: 10, mcc: 1 },
						link: "http://www.google.de"
					}
				]
			}
		]
	},
	settings: {
		fileSettings: {
			attributeTypes: { nodes: [], edges: [] },
			blacklist: [],
			edges: VALID_EDGES,
			markedPackages: []
		}
	}
}

export const TEST_FILE_DATA_DOWNLOADED = {
	apiVersion: "1.1",
	attributeTypes: {},
	blacklist: [],
	markedPackages: [],
	edges: [
		{
			attributes: { avgCommits: 34, pairingRate: 89 },
			fromNodeName: "/root/big leaf",
			toNodeName: "/root/Parent Leaf/small leaf"
		},
		{
			attributes: { avgCommits: 34, pairingRate: 89 },
			fromNodeName: "/root/sample1 only leaf",
			toNodeName: "/root/Parent Leaf/small leaf"
		}
	],
	nodes: [
		{
			attributes: {},
			children: [
				{
					attributes: { Functions: 10, MCC: 1, RLOC: 100 },
					link: "http://www.google.de",
					name: "big leaf",
					type: "File"
				},
				{
					attributes: {},
					children: [
						{
							attributes: { Functions: 100, MCC: 100, RLOC: 30 },
							name: "small leaf",
							type: "File"
						},
						{
							attributes: { Functions: 1000, MCC: 10, RLOC: 70 },
							name: "other small leaf",
							type: "File"
						}
					],
					name: "Parent Leaf",
					type: "Folder"
				}
			],
			name: "root",
			type: "Folder"
		}
	],
	projectName: "Sample Map"
}

export const FILE_STATES: FileState[] = [
	{
		file: TEST_FILE_DATA,
		selectedAs: FileSelectionState.Single
	}
]

export const SETTINGS: Settings = {
	fileSettings: {
		attributeTypes: {
			nodes: [
				{
					rloc: AttributeTypeValue.absolute
				},
				{
					mcc: AttributeTypeValue.absolute
				},
				{
					coverage: AttributeTypeValue.relative
				},
				{
					pairing_rate: AttributeTypeValue.absolute
				}
			],
			edges: []
		},
		blacklist: [],
		edges: [],
		markedPackages: []
	},
	dynamicSettings: {
		areaMetric: "rloc",
		heightMetric: "mcc",
		colorMetric: "mcc",
		distributionMetric: "mcc",
		edgeMetric: "pairingRate",
		focusedNodePath: "/root",
		searchedNodePaths: [],
		searchPattern: "",
		margin: 48,
		colorRange: {
			from: 19,
			to: 67
		}
	},
	appSettings: {
		amountOfTopLabels: 31,
		amountOfEdgePreviews: 5,
		scaling: new Vector3(1, 1.8, 1),
		camera: new Vector3(0, 300, 1000),
		invertDeltaColors: false,
		enableEdgeArrows: true,
		hideFlatBuildings: true,
		maximizeDetailPanel: false,
		invertHeight: true,
		invertColorRange: false,
		dynamicMargin: true,
		isWhiteBackground: false,
		whiteColorBuildings: true,
		mapColors: {
			positive: "#69AE40",
			neutral: "#ddcc00",
			negative: "#820E0E",
			selected: "#EB8319",
			defaultC: "#89ACB4",
			positiveDelta: "#69FF40",
			negativeDelta: "#ff0E0E",
			base: "#666666",
			flat: "#AAAAAA",
			lightGrey: "#DDDDDD",
			angularGreen: "#00BFA5",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"]
		},
		isPresentationMode: false
	},
	treeMapSettings: {
		mapSize: 500
	}
}

export const DEFAULT_SETTINGS: Settings = {
	appSettings: {
		amountOfTopLabels: 1,
		amountOfEdgePreviews: 1,
		camera: new Vector3(0, 300, 1000),
		invertDeltaColors: false,
		dynamicMargin: true,
		enableEdgeArrows: true,
		hideFlatBuildings: true,
		invertHeight: false,
		invertColorRange: false,
		isWhiteBackground: false,
		mapColors: {
			angularGreen: "#00BFA5",
			base: "#666666",
			defaultC: "#89ACB4",
			flat: "#AAAAAA",
			lightGrey: "#DDDDDD",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
			negative: "#820E0E",
			negativeDelta: "#ff0E0E",
			neutral: "#ddcc00",
			positive: "#69AE40",
			positiveDelta: "#69FF40",
			selected: "#EB8319"
		},
		maximizeDetailPanel: false,
		scaling: new Vector3(1, 1, 1),
		whiteColorBuildings: false,
		isPresentationMode: false
	},
	dynamicSettings: {
		areaMetric: null,
		colorMetric: null,
		focusedNodePath: "",
		heightMetric: null,
		distributionMetric: null,
		edgeMetric: "",
		margin: null,
		colorRange: {
			from: null,
			to: null
		},
		searchPattern: "",
		searchedNodePaths: []
	},
	fileSettings: { attributeTypes: { nodes: [], edges: [] }, blacklist: [], edges: [], markedPackages: [] },
	treeMapSettings: { mapSize: 500 }
}

export const TEST_NODE_ROOT: Node = {
	name: "root",
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15 },
	heightDelta: 10,
	visible: true,
	path: "/root",
	origin: "root",
	link: "NO_LINK",
	markingColor: "0x000000",
	flat: false,
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const TEST_NODE_LEAF: Node = {
	name: "root/big leaf",
	width: 1,
	height: 2,
	length: 3,
	depth: 4,
	x0: 5,
	z0: 6,
	y0: 7,
	isLeaf: true,
	deltas: { a: 1, b: 2 },
	attributes: { a: 20, b: 15 },
	heightDelta: 20,
	visible: true,
	path: "/root/big leaf",
	origin: "root",
	link: "NO_LINK",
	markingColor: "0xFFFFFF",
	flat: false,
	incomingEdgePoint: new Vector3(),
	outgoingEdgePoint: new Vector3()
}

export const TEST_NODES: Node[] = [TEST_NODE_ROOT, TEST_NODE_LEAF]

export const CODE_MAP_BUILDING: CodeMapBuilding = new CodeMapBuilding(
	1,
	new Box3(),
	TEST_NODE_ROOT,
	DEFAULT_SETTINGS.appSettings.mapColors.neutral
)

export const METRIC_DATA: MetricData[] = [
	{ name: "mcc", maxValue: 1, availableInVisibleMaps: true },
	{ name: "rloc", maxValue: 2, availableInVisibleMaps: true }
]
