import _ from "lodash"
import { CCAction } from "../../model/codeCharta.model"
import { StateActions } from "./state.actions"
import { DynamicSettingsActions } from "./dynamicSettings/dynamicSettings.actions"
import { FileSettingsActions } from "./fileSettings/fileSettings.actions"
import { AppSettingsActions } from "./appSettings/appSettings.actions"
import { splitDynamicSettingsActions } from "./dynamicSettings/dynamicSettings.splitter"
import { splitFileSettingsActions } from "./fileSettings/fileSettings.splitter"
import { splitAppSettingsActions } from "./appSettings/appSettings.splitter"
import { splitTreeMapSettingsActions } from "./treeMap/treeMap.splitter"
import { TreeMapSettingsActions } from "./treeMap/treeMap.actions"
import { splitFilesAction } from "./files/files.splitter"
import { FilesActions } from "./files/files.actions"

export function splitStateActions(action: CCAction): CCAction[] {
	if (_.values(DynamicSettingsActions).includes(action.type)) {
		return splitDynamicSettingsActions(action.payload)
	}

	if (_.values(FileSettingsActions).includes(action.type)) {
		return splitFileSettingsActions(action.payload)
	}

	if (_.values(AppSettingsActions).includes(action.type)) {
		return splitAppSettingsActions(action.payload)
	}

	if (_.values(TreeMapSettingsActions).includes(action.type)) {
		return splitTreeMapSettingsActions(action.payload)
	}

	if (_.values(FilesActions).includes(action.type)) {
		return splitFilesAction(action.payload)
	}

	if (_.values(StateActions).includes(action.type)) {
		let actions: CCAction[] = []

		if (action.payload.dynamicSettings !== undefined) {
			actions = actions.concat(...splitDynamicSettingsActions(action.payload.dynamicSettings))
		}

		if (action.payload.fileSettings !== undefined) {
			actions = actions.concat(splitFileSettingsActions(action.payload.fileSettings))
		}

		if (action.payload.appSettings !== undefined) {
			actions = actions.concat(splitAppSettingsActions(action.payload.appSettings))
		}

		if (action.payload.treeMap !== undefined) {
			actions = actions.concat(splitTreeMapSettingsActions(action.payload.treeMap))
		}

		if (action.payload.files !== undefined) {
			actions = actions.concat(splitFilesAction(action.payload.files))
		}
		return actions
	}
	return [action]
}
