import { Compass } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="animate-fade-up">
      <PageHeader title="Page not found" />
      <EmptyState
        icon={Compass}
        title="That page isn't part of the demo"
        description="Check the address or head back to the workshop dashboard to keep exploring."
        action={
          <ButtonLink href="/">
            Back to dashboard
          </ButtonLink>
        }
      />
    </div>
  );
}
