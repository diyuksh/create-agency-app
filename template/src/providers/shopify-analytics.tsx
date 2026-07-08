"use client";

import { useEffect } from "react";
import { useLoadScript } from "@shopify/hydrogen-react";

export function ShopifyAnalytics() {
  const loaded = useLoadScript("https://cdn.shopify.com/shopifycloud/customer-privacy-api/v1/customer-privacy.js");

  useEffect(() => {
    if (loaded && window.Shopify && window.Shopify.customerPrivacy) {
      window.Shopify.customerPrivacy.userCanBeTracked();
    }
  }, [loaded]);

  return null;
}
