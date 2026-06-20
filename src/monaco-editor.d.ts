declare module 'monaco-editor' {
  export namespace editor {
    export type IMarkerData = any
    export type IEditorDecorationsCollection = any
    export type IStandaloneCodeEditor = any
    export const setModelMarkers: any
    export const getModel: any
    export const getModels: any
    export const getModelMarkers: any
    export const createModel: any
  }
  export namespace languages {
    export const WorkspaceEdit: any
    export const applyWorkspaceEdit: any
    export const registerInlineCompletionsProvider: any
  }
  export const Uri: any
  export const Range: any
  export const MarkerSeverity: any
  export type MarkerSeverity = any
  export type Range = any
}
