import { Attribution } from "ox/erc8021";
import { concat, type Hex } from "viem";

export const BUILDER_CODE = "bc_pf94rmhj";
export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

// Use identical bytes for simulation, gas estimation, submission and receipt checks.
export function withBuilderAttribution(data: Hex): Hex {
  return concat([data, BUILDER_DATA_SUFFIX]);
}
