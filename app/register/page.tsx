import type { Metadata } from "next";
import { SelfRegistration } from "@/components/features/SelfRegistration";

export const metadata: Metadata = {
  title: "ចុះឈ្មោះដោយខ្លួនឯង — Self registration",
  description: "ចុះឈ្មោះប្រវត្តិរូបដោយខ្លួនឯង។",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <SelfRegistration token={params.token ?? ""} />;
}