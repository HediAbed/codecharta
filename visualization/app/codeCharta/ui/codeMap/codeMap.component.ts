import {CodeMapBuilding} from "./rendering/codeMapBuilding";
import {ThreeViewerService} from "./threeViewer/threeViewerService";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";

import "./codeMap.component.scss";

import angular, {IRootScopeService, ITimeoutService} from "angular";
import {NodeContextMenuController} from "../nodeContextMenu/nodeContextMenu.component";
import {LoadingGifController} from "../loadingGif/loadingGif.component";
import { LoadingGifComponentSubscriber, LoadingGifService } from "../loadingGif/loadingGif.service"

export class CodeMapController implements CodeMapMouseEventServiceSubscriber, LoadingGifComponentSubscriber {

    private _viewModel: {
        isLoadingFile: boolean
    } = {
        isLoadingFile: true
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $timeout: ITimeoutService,
        private $element: Element,
        private threeViewerService: ThreeViewerService,
        private codeMapMouseEventService: CodeMapMouseEventService,
    ) {
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
        LoadingGifService.subscribe(this.$rootScope, this)
    }

    public $postLink() {
        this.threeViewerService.init(this.$element[0].children[0]);
        this.threeViewerService.animate();
        this.codeMapMouseEventService.start();
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {
        NodeContextMenuController.broadcastHideEvent(this.$rootScope);
        if (building) {
            const nodeType = (building.node.isLeaf) ? "File" : "Folder";
            NodeContextMenuController.broadcastShowEvent(this.$rootScope, building.node.path, nodeType, x, y);
        }
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    public onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
    }

    public onLoadingFileStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent) {
        this._viewModel.isLoadingFile = isLoadingFile
        this.synchronizeAngularTwoWayBinding()
    }

    public onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent) {
    }

    private synchronizeAngularTwoWayBinding() {
        this.$timeout(() => {})
    }

}

export const codeMapComponent = {
    selector: "codeMapComponent",
    template: require("./codeMap.component.html"),
    controller: CodeMapController
};



