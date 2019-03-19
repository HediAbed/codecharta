"use strict"

import * as THREE from "three"
import { SettingsServiceSubscriber, SettingsService } from "../../../state/settings.service"
import {PerspectiveCamera} from "three"
import { IAngularEvent, IRootScopeService } from "angular"
import {Settings, Vector3d} from "../../../codeCharta.model"

class ThreeCameraService implements SettingsServiceSubscriber {
	public static SELECTOR = "threeCameraService"

	public static VIEW_ANGLE = 45
	public static NEAR = 100
	public static FAR = 200000 //TODO optimize renderer for far objects

	public camera: PerspectiveCamera
	private lastCameraVector: Vector3d = {x: 0,y: 0,z: 0}

	constructor(private $rootScope: IRootScopeService) {}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
		if (settings.appSettings.camera.toString() != this.lastCameraVector.toString()) {
			this.lastCameraVector = settings.appSettings.camera
		 	this.setPosition(settings.appSettings.camera.x, settings.appSettings.camera.y, settings.appSettings.camera.z)
		}
	}

	public init(settingsService: SettingsService, containerWidth: number, containerHeight: number, x: number, y: number, z: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new THREE.PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition(x, y, z)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public setPosition(x: number, y: number, z: number) {
		this.camera.position.set(x, y, z)
	}
}

export { ThreeCameraService }
