import { CodeMapNode } from "../codeCharta.model"
import { ValidationError, Validator, ValidatorResult } from "jsonschema"

const jsonSchema = require("./schema.json")
const latestApiVersion = require("../../../package.json").codecharta.apiVersion

interface ApiVersion {
	major: number
	minor: number
}

export interface CCValidationResult {
	error: string[]
	warning: string[]
	title: string
}

export class FileValidator {
	private static FILE_IS_INVALID = ["file is empty or invalid", "Error Loading File"]
	private static API_VERSION_IS_INVALID = ["file API Version is empty or invalid", "File API Version Error"]
	private static API_VERSION_IS_OUTDATED = [
		"API Version Outdated: Update CodeCharta API Version to match cc.json",
		"Error CodeCharta Major API Version"
	]
	private static MINOR_API_VERSION_IS_OUTDATED = ["Minor API Version Outdated", "Warning CodeCharta Minor API Version"]
	private static NODES_NOT_UNIQUE = ["node names in combination with node types are not unique", "Uniqueness Error"]
	private static VALIDATION_ERROR_TITLE = "Validation Error"

	public static validate(file: { apiVersion: string; nodes: CodeMapNode[] }): CCValidationResult {
		let result: CCValidationResult = { error: [], warning: [], title: "" }

		if (!file) {
			result.error.push(this.FILE_IS_INVALID[0])
			result.title = this.FILE_IS_INVALID[1]
		} else if (!this.isValidApiVersion(file)) {
			result.error.push(this.API_VERSION_IS_INVALID[0])
			result.title = this.API_VERSION_IS_INVALID[1]
		} else if (this.fileHasHigherMajorVersion(file)) {
			result.error.push(this.API_VERSION_IS_OUTDATED[0])
			result.title = this.API_VERSION_IS_OUTDATED[1]
		} else if (this.fileHasHigherMinorVersion(file)) {
			result.warning.push(this.MINOR_API_VERSION_IS_OUTDATED[0])
			result.title = this.MINOR_API_VERSION_IS_OUTDATED[1]
		}

		if (result.error.length === 0) {
			let validator = new Validator()
			let validationResult: ValidatorResult = validator.validate(file, jsonSchema)

			if (validationResult.errors.length !== 0) {
				result.error = validationResult.errors.map((error: ValidationError) => this.getValidationMessage(error))
				result.title = this.VALIDATION_ERROR_TITLE
			} else if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
				result.error.push(this.NODES_NOT_UNIQUE[0])
				result.title = this.NODES_NOT_UNIQUE[1]
			}
		}
		return result
	}

	private static getValidationMessage(error) {
		return "Parameter: " + error.property + " is not of type " + error.argument
	}

	private static hasUniqueChildren(node: CodeMapNode): boolean {
		if (!node.children || node.children.length === 0) {
			return true
		}

		let names = {}
		node.children.forEach(child => (names[child.name + child.type] = true))

		if (Object.keys(names).length !== node.children.length) {
			return false
		}

		for (let child of node.children) {
			if (!FileValidator.hasUniqueChildren(child)) {
				return false
			}
		}
		return true
	}

	private static isValidApiVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = file.apiVersion
		const hasApiVersion = apiVersion !== undefined
		const versionRegExp = new RegExp("[0-9]+.[0-9]+")
		const isValidVersion = versionRegExp.test(apiVersion)
		return hasApiVersion && isValidVersion
	}

	private static fileHasHigherMajorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = this.getAsApiVersion(file.apiVersion)
		return apiVersion.major > this.getAsApiVersion(latestApiVersion).major
	}

	private static fileHasHigherMinorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = this.getAsApiVersion(file.apiVersion)
		return apiVersion.minor > this.getAsApiVersion(latestApiVersion).minor
	}

	private static getAsApiVersion(version: string): ApiVersion {
		return {
			major: Number(version.split(".")[0]),
			minor: Number(version.split(".")[1])
		}
	}
}
