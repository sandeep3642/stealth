"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProvisionBrandingRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/provisionBranding/0");
  }, [router]);

  return null;
};

export default ProvisionBrandingRedirectPage;
