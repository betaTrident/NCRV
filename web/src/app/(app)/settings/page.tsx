import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { signOut } from "@/server/actions/auth"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ACCOUNT SETUP"
        title="Settings"
        description="Your profile, computation preferences, and the read-only ADP wage reference."
        action={
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        }
      />
      <EmptyState
        title="Profile and computation settings aren't connected yet"
        description="Saving your profile and computation preferences arrives with account setup."
        action={
          <Button disabled aria-disabled="true">
            Save profile
          </Button>
        }
      />
    </div>
  )
}
