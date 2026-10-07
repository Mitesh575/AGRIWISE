import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackToFarmTools() {
  return (
    <Link
      to="/"
      hash="farm-tools"
      className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:gap-3"
    >
      <ArrowLeft size={16} /> Back to Farm Tools
    </Link>
  );
}
