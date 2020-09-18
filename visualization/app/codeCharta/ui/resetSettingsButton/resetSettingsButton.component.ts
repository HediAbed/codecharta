import "./resetSettingsButton.component.scss"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { defaultState, setState } from "../../state/store/state.actions"
import { convertToVectors } from "../../util/settingsHelper"

export class ResetSettingsButtonController {
	private settingsNames = ""

	/* @ngInject */
	constructor(private storeService: StoreService) {}

	applyDefaultSettings() {
		const tokens = this.settingsNames.replace(/ |\n/g, "").split(",")
		const updatedSettings: RecursivePartial<Settings> = {}

		for (const token of tokens) {
			const steps = token.split(".")

			let defaultSettingsPointer = defaultState
			// TODO: This intermediate variable should be obsolete
			let updatedSettingsPointer = updatedSettings

			steps.forEach((step, index) => {
				// TODO: Check if this could be improved performance wise.
				if (defaultSettingsPointer[step] !== undefined) {
					if (!updatedSettingsPointer[step]) {
						updatedSettingsPointer[step] = {}
					}
					if (index === steps.length - 1) {
						updatedSettingsPointer[step] = defaultSettingsPointer[step]
					} else {
						defaultSettingsPointer = defaultSettingsPointer[step]
						updatedSettingsPointer = updatedSettingsPointer[step]
					}
				}
			})
		}

		if (Object.keys(updatedSettings).length > 0) {
			convertToVectors(updatedSettings)
			this.storeService.dispatch(setState(updatedSettings))
		}
	}
}

export const resetSettingsButtonComponent = {
	selector: "resetSettingsButtonComponent",
	template: require("./resetSettingsButton.component.html"),
	controller: ResetSettingsButtonController,
	bindings: {
		settingsNames: "@",
		tooltip: "@"
	}
}
