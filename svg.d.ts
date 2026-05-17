// Type declarations for SVG imports handled by SVGR (@svgr/webpack).
// This lets TypeScript understand `import Icon from "./Icon.svg"` as a
// React component, matching the SVGR setup in next.config.ts.

declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}
