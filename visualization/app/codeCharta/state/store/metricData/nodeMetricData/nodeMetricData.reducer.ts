import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { BlacklistItem, BlacklistType, NodeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { isLeaf, isPathBlacklisted } from "../../../../util/codeMapHelper"
import { hierarchy } from "d3-hierarchy"
import { sortByMetricName } from "../metricData.reducer"
import { ERROR_MESSAGES } from "../../../../util/fileValidator"

export function nodeMetricData(state = setNodeMetricData().payload, action: NodeMetricDataAction) {
	switch (action.type) {
		case NodeMetricDataActions.SET_NODE_METRIC_DATA:
			return action.payload
		case NodeMetricDataActions.CALCULATE_NEW_NODE_METRIC_DATA:
			return setNewMetricData(action.payload.fileStates, action.payload.blacklist)
		default:
			return state
	}
}

function setNewMetricData(fileStates: FileState[], blacklist: BlacklistItem[]) {
	const hashMap: Map<string, number> = new Map()

	for (const { file } of getVisibleFileStates(fileStates)) {
		for (const node of hierarchy(file.map)) {
			if (isLeaf(node) && node.data.path && !isPathBlacklisted(node.data.path, blacklist, BlacklistType.exclude)) {
				for (const metric of Object.keys(node.data.attributes)) {
					const maxValue = hashMap.get(metric)

					if (maxValue === undefined || maxValue <= node.data.attributes[metric]) {
						hashMap.set(metric, node.data.attributes[metric])
					}
				}
			}
		}

		if (hashMap.size === 0) {
			throw new Error(ERROR_MESSAGES.metricDataUnavailable)
		}
	}

	const metricData: NodeMetricData[] = []

	for (const [key, value] of hashMap) {
		metricData.push({
			name: key,
			maxValue: value
		})
	}
	sortByMetricName(metricData)
	return metricData
}
