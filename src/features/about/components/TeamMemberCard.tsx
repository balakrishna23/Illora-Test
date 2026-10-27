import Image from "next/image";
import { ExternalLinkIcon } from "lucide-react";

import type { TeamMember } from "@/features/about/queries";
import { teamPhotoUrl } from "@/server/lib/team-photos";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const photo = teamPhotoUrl(member.name);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
          {photo ? (
            <Image
              src={photo}
              alt={`Portrait of ${member.name}`}
              fill
              sizes="80px"
              className="object-cover object-top"
            />
          ) : (
            <span
              className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {initials(member.name)}
            </span>
          )}
        </div>
        <div className="flex flex-1 items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <p className="text-sm text-primary font-medium mt-0.5">{member.role}</p>
            {member.culturalConnection && (
              <p className="text-xs text-muted-foreground mt-1">{member.culturalConnection}</p>
            )}
          </div>
          {member.linkedIn && (
            <a
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLinkIcon className="size-4" />
            </a>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
    </div>
  );
}
