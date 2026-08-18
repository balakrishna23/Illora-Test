import { redirect } from "next/navigation";

// Some existing UI/browser flows are landing on /portal/admin even though the
// real admin area lives at /admin. Redirecting here avoids a confusing 404 for
// signed-in admins.
export default function LegacyPortalAdminPage() {
  redirect("/admin");
}
