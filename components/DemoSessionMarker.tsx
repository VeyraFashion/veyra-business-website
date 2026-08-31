"use client";

import { useEffect } from "react";
import { rememberDemo } from "@/lib/use-demo-memory";

/** Mounted on every /demo/<brandId> page. Renders nothing — just records that this brand's
 *  demo was opened, so DemoReturnChip can offer a way back if the visitor navigates to the
 *  main site afterward. */
export default function DemoSessionMarker({ brandId, brand }: { brandId: string; brand: string }) {
  useEffect(() => {
    rememberDemo(brandId, brand);
  }, [brandId, brand]);

  return null;
}
