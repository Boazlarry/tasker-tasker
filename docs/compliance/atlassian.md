# Atlassian Compliance Notes

This is an engineering compliance note, not legal advice.

## Current Position

- Tasker Tasker is an independent compatibility tool for user-configured Jira instances.
- The product name must remain centered on `Tasker Tasker`, not Jira or Atlassian.
- Jira and Atlassian marks are used only to describe interoperability.
- The app must not imply Atlassian sponsorship, endorsement, certification, or affiliation.
- The app must not copy, frame, or reproduce Atlassian product UI, icons, logos, Marketplace assets, or proprietary content.
- Calls to Jira APIs should be user-driven or part of reasonable testing.
- The app must not bypass Jira permissions, workflow rules, rate limits, or technical restrictions.
- The app must not be used for load testing, benchmarking, competitive analysis, scraping, or credential harvesting.

## Credential Boundary

- Vercel deployment is for mock/demo inspection only.
- Do not enter real Jira credentials into the Vercel deployment.
- Web MVP persistence is local browser storage only.
- Real Jira credentials should be used only in local execution or a future Tauri flow with local OS-backed secure storage.
- Server-side code must not log credentials, persist credentials, or add telemetry containing credentials.

## API Compatibility Boundary

- Jira 7.x/Data Center compatibility uses Jira REST API v2 paths such as `/rest/api/2/project`, `/rest/api/2/search`, and `/rest/api/2/issue`.
- Jira Cloud compatibility can use the same broad REST API v2 shape for the current MVP, but Cloud-specific auth and API behavior must be verified separately before claiming support.
- API calls should preserve Jira validation and permission errors instead of masking them.

## Trademark Boundary

- Acceptable wording: `Tasker Tasker works with Jira`.
- Avoid wording that suggests Atlassian ownership, such as `Jira Tasker` or `official Jira`.
- Do not use Atlassian logos or Atlassian visual identity in screenshots, docs, app icons, or marketing.

## References

- Atlassian Developer Terms: https://developer.atlassian.com/platform/marketplace/atlassian-developer-terms/
- Atlassian Acceptable Use Policy: https://www.atlassian.com/legal/acceptable-use-policy
- Atlassian Trademark Guidelines: https://www.atlassian.com/legal/trademark
- Jira 7.0 REST API: https://docs.atlassian.com/software/jira/docs/api/REST/7.0.0/

